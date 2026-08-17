import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getSystemSetting, fetchProducts } from '@/lib/api';

// Khởi tạo Gemini AI với API key từ môi trường
// Nếu chưa có API key, nó sẽ throw error lúc khởi tạo nên tạm để trong function.
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json({ 
        reply: 'Hệ thống chưa được cấu hình GEMINI_API_KEY trong file .env.local. Vui lòng cấu hình để tính năng Chat AI hoạt động.' 
      });
    }

    // Load dữ liệu thực tế từ database
    const contactSettingsRaw = await getSystemSetting('contact_settings').catch(() => null);
    const footerSettingsRaw = await getSystemSetting('footer_settings').catch(() => null);
    
    let contactSettings = null;
    if (contactSettingsRaw && contactSettingsRaw.value) {
      try { contactSettings = JSON.parse(contactSettingsRaw.value); } catch (e) {}
    }
    let footerSettings = null;
    if (footerSettingsRaw && footerSettingsRaw.value) {
      try { footerSettings = JSON.parse(footerSettingsRaw.value); } catch (e) {}
    }

    // Lấy danh sách sản phẩm thực tế từ Database (giới hạn 30 sản phẩm mới nhất)
    const productsData = await fetchProducts(undefined, undefined, 0, 30).catch(() => ({ products: [] }));
    const productListText = productsData.products.length > 0 
      ? productsData.products.map(p => `- ${p.name} (Giá: ${p.baseSalePrice ? p.baseSalePrice : p.basePrice} VNĐ) - MÃ SẢN PHẨM: ${p.id}`).join('\n')
      : 'Hiện tại chưa có sản phẩm nào.';

    const hotline = contactSettings?.hotline || '1900 1234';
    const email = contactSettings?.email || 'support@phonestore.com';
    const address = footerSettings?.address || 'Hà Nội, Việt Nam';

    // Cấu hình ngữ cảnh (System Instruction)
    const contextPrompt = `
Bạn là "PhoneBot" - Nhân viên chăm sóc khách hàng tư vấn bằng AI thông minh của "Phone Store".
Phone Store là một hệ thống bán lẻ điện thoại di động chính hãng uy tín số 1 Việt Nam.
Giọng văn của bạn phải lịch sự, thân thiện, chuyên nghiệp, nhiệt tình, xưng "mình" hoặc "chúng tôi" và gọi khách hàng là "bạn" hoặc "quý khách".

QUAN TRỌNG NHẤT: 
1. Khi khách hàng hỏi mua điện thoại hoặc nhờ tư vấn điện thoại, bạn CHỈ ĐƯỢC PHÉP gợi ý các sản phẩm có trong danh sách CÁC SẢN PHẨM HIỆN CÓ dưới đây. TUYỆT ĐỐI KHÔNG ĐƯỢC bịa ra sản phẩm khác (như iPhone 15, S24...) nếu nó không có trong danh sách.
2. NẾU KHÁCH HÀNG KHÔNG HỎI VỀ SẢN PHẨM HOẶC KHÔNG NHỜ TƯ VẤN MUA HÀNG, TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý NHẮC ĐẾN BẤT KỲ SẢN PHẨM NÀO. Hãy trả lời đúng trọng tâm câu hỏi (ví dụ: xin địa chỉ, liên hệ, chính sách).

--- CÁC SẢN PHẨM HIỆN CÓ TRONG CỬA HÀNG ---
${productListText}
-------------------------------------------

Dưới đây là một số thông tin cấu hình thực tế của hệ thống:
- Hotline: ${hotline}
- Email: ${email}
- Địa chỉ cửa hàng chính: ${address}
- Giờ làm việc: 8:00 - 22:00
- Miễn phí giao hàng: đơn từ 5.000.000 VNĐ.
`;

    // Sử dụng model Flash (Tốc độ cao, giới hạn gọi API cao hơn 1500 lần/ngày)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', systemInstruction: contextPrompt });

    // Lọc lịch sử: Gemini yêu cầu tin nhắn đầu tiên phải là từ 'user' và các tin nhắn phải xen kẽ 'user' - 'model'
    let validHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      // Khi gửi lịch sử cho AI, nhớ xoá các thẻ parse để AI không bị loạn
      parts: [{ text: msg.text.replace(/\[.*?\|.*?\]/g, '').replace(/\[IDS:.*?\]/g, '').trim() }]
    }));
    // Thêm dòng log này để báo cho Next.js biên dịch lại file (Clear Turbopack cache V5)
    console.log("Processing chat with validHistory length (v5):", validHistory.length);

    // Bỏ qua tin nhắn chào mừng ban đầu của model nếu nó đứng đầu
    if (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }

    // Tạo luồng chat với lịch sử
    const chat = model.startChat({
      history: validHistory
    });

    // Ép AI luôn luôn trả về 3 câu hỏi gợi ý và danh sách ID sản phẩm
    const finalMessage = message + '\n\n(BẮT BUỘC: 1. Nếu bạn giới thiệu bất kỳ sản phẩm nào, hãy in danh sách MÃ SẢN PHẨM của chúng ở cuối cùng, định dạng: [IDS: id1, id2]. Nếu không giới thiệu sản phẩm nào, bỏ qua. 2. Ở dòng cuối cùng, hãy tạo đúng 3 câu hỏi gợi ý ngắn, định dạng: [Câu 1 | Câu 2 | Câu 3].)';

    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    let text = response.text();

    let suggestedProducts: any[] = [];
    
    // Parse [IDS: ...]
    const idsMatch = text.match(/\[IDS:(.*?)\]/);
    if (idsMatch) {
      const idsStr = idsMatch[1];
      const ids = idsStr.split(',').map(s => s.trim()).filter(Boolean);
      suggestedProducts = productsData.products.filter(p => ids.includes(p.id.toString()));
      text = text.replace(/\[IDS:.*?\]/g, '').trim();
    }

    return NextResponse.json({ reply: text, products: suggestedProducts });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ 
      reply: 'Xin lỗi bạn, hiện tại hệ thống AI đang xử lý quá nhiều yêu cầu nên bị nghẽn mạng (Quá tải). Bạn vui lòng đợi khoảng 1 phút rồi thử hỏi lại, hoặc gọi Hotline 1900 1234 để được nhân viên hỗ trợ trực tiếp nhé!' 
    }, { status: 200 });
  }
}
