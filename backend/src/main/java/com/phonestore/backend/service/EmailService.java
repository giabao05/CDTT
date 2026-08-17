package com.phonestore.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;
import com.phonestore.backend.entity.Order;
import com.phonestore.backend.entity.OrderItem;
import org.springframework.core.io.ByteArrayResource;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("giabaolesag@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Mã xác thực OTP - Quên mật khẩu");
        message.setText("Xin chào,\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu.\n" +
                "Mã OTP của bạn là: " + otp + "\n\n" +
                "Mã này sẽ hết hạn sau 5 phút.\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\nPhoneStore Team");

        mailSender.send(message);
    }

    public void sendContactEmail(String senderName, String senderEmail, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("giabaolesag@gmail.com");
            helper.setTo("giabaolesag@gmail.com");
            helper.setSubject("Liên hệ mới từ khách hàng: " + senderName);
            
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background-color: #ffffff;\">"
                    + "<div style=\"text-align: center; border-bottom: 2px solid #ff0000; padding-bottom: 20px; margin-bottom: 25px;\">"
                    + "<h1 style=\"color: #ff0000; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-size: 28px;\">PHONE STORE</h1>"
                    + "<p style=\"color: #777; margin: 8px 0 0 0; font-size: 14px;\">Hệ thống bán lẻ điện thoại di động chính hãng</p>"
                    + "</div>"
                    + "<div style=\"color: #333; line-height: 1.6;\">"
                    + "<h2 style=\"color: #111; font-size: 20px; margin-top: 0;\">Bạn nhận được một tin nhắn liên hệ mới!</h2>"
                    + "<p style=\"font-size: 15px; margin-bottom: 25px; color: #555;\">Dưới đây là thông tin chi tiết từ khách hàng:</p>"
                    + "<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px;\">"
                    + "<tr><td style=\"padding: 12px; border-bottom: 1px solid #eee; width: 120px;\"><strong>Họ và tên:</strong></td>"
                    + "<td style=\"padding: 12px; border-bottom: 1px solid #eee;\">" + senderName + "</td></tr>"
                    + "<tr><td style=\"padding: 12px; border-bottom: 1px solid #eee;\"><strong>Email:</strong></td>"
                    + "<td style=\"padding: 12px; border-bottom: 1px solid #eee;\"><a href=\"mailto:" + senderEmail + "\" style=\"color: #ff0000; text-decoration: none; font-weight: bold;\">" + senderEmail + "</a></td></tr>"
                    + "</table>"
                    + "<div style=\"background-color: #fcfcfc; padding: 20px; border-left: 4px solid #ff0000; border-radius: 0 8px 8px 0; margin: 20px 0;\">"
                    + "<h4 style=\"margin-top: 0; color: #444; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;\">Nội dung tin nhắn:</h4>"
                    + "<p style=\"margin: 0; white-space: pre-wrap; color: #222; font-size: 15px; line-height: 1.8;\">" + content + "</p>"
                    + "</div>"
                    + "</div>"
                    + "<div style=\"text-align: center; margin-top: 40px; font-size: 13px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px;\">"
                    + "<p style=\"margin: 0 0 5px 0;\">Email này được gửi tự động từ hệ thống Website PhoneStore.</p>"
                    + "<p style=\"margin: 0;\">&copy; 2025 Phone Store. All rights reserved.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendOrderConfirmationEmail(Order order, String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("giabaolesag@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Đặt hàng thành công - Đơn hàng " + order.getOrderCode());
            
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            
            StringBuilder itemsHtml = new StringBuilder();
            Map<String, byte[]> inlineImages = new HashMap<>();
            Map<String, String> inlineContentTypes = new HashMap<>();
            
            int imgCounter = 0;
            
            for (OrderItem item : order.getItems()) {
                String imgUrl = item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getThumbnail() : null;
                String cid = "placeholder";
                
                if (imgUrl != null && imgUrl.startsWith("data:image")) {
                    try {
                        String[] parts = imgUrl.split(",");
                        String metadata = parts[0];
                        String base64Data = parts[1];
                        
                        String contentType = metadata.substring(metadata.indexOf(":") + 1, metadata.indexOf(";"));
                        byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
                        
                        cid = "product_image_" + imgCounter++;
                        inlineImages.put(cid, decodedBytes);
                        inlineContentTypes.put(cid, contentType);
                    } catch (Exception e) {
                        cid = "placeholder";
                    }
                }
                
                String imgSrc = cid.equals("placeholder") ? "https://via.placeholder.com/80" : "cid:" + cid;
                String variantName = item.getVariant() != null ? item.getVariant().getColor() + " - " + item.getVariant().getStorage() : "";
                
                itemsHtml.append("<tr>")
                         .append("<td style=\"padding: 15px; border-bottom: 1px solid #eee; width: 80px;\">")
                         .append("<img src=\"").append(imgSrc).append("\" width=\"80\" style=\"border-radius: 8px; border: 1px solid #eee; object-fit: cover;\">")
                         .append("</td>")
                         .append("<td style=\"padding: 15px; border-bottom: 1px solid #eee;\">")
                         .append("<h4 style=\"margin: 0 0 5px 0; color: #333; font-size: 15px;\">").append(item.getProductName()).append("</h4>")
                         .append("<p style=\"margin: 0; color: #777; font-size: 13px;\">Phân loại: ").append(variantName).append("</p>")
                         .append("<p style=\"margin: 5px 0 0 0; color: #555; font-size: 13px;\">SL: ").append(item.getQuantity()).append("</p>")
                         .append("</td>")
                         .append("<td style=\"padding: 15px; border-bottom: 1px solid #eee; text-align: right;\">")
                         .append("<strong style=\"color: #ff0000; font-size: 15px;\">").append(currencyFormat.format(item.getTotalPrice())).append("</strong>")
                         .append("</td>")
                         .append("</tr>");
            }
            
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background-color: #ffffff;\">"
                    + "<div style=\"text-align: center; border-bottom: 2px solid #ff0000; padding-bottom: 20px; margin-bottom: 25px;\">"
                    + "<h1 style=\"color: #ff0000; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-size: 28px;\">PHONE STORE</h1>"
                    + "<p style=\"color: #777; margin: 8px 0 0 0; font-size: 14px;\">Cảm ơn bạn đã mua sắm tại PhoneStore!</p>"
                    + "</div>"
                    + "<div style=\"color: #333; line-height: 1.6;\">"
                    + "<h2 style=\"color: #111; font-size: 20px; margin-top: 0;\">Đặt hàng thành công!</h2>"
                    + "<p style=\"font-size: 15px; margin-bottom: 25px; color: #555;\">Xin chào <strong>" + order.getShippingName() + "</strong>,<br/>Đơn hàng <strong>" + order.getOrderCode() + "</strong> của bạn đã được ghi nhận hệ thống. Chúng tôi đang xử lý và sẽ giao đến bạn trong thời gian sớm nhất.</p>"
                    
                    + "<h3 style=\"color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;\">Thông tin giao hàng</h3>"
                    + "<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;\">"
                    + "<tr><td style=\"padding: 8px 0; color: #666; width: 120px;\">Người nhận:</td><td style=\"padding: 8px 0; font-weight: 500;\">" + order.getShippingName() + "</td></tr>"
                    + "<tr><td style=\"padding: 8px 0; color: #666;\">Điện thoại:</td><td style=\"padding: 8px 0; font-weight: 500;\">" + order.getShippingPhone() + "</td></tr>"
                    + "<tr><td style=\"padding: 8px 0; color: #666;\">Địa chỉ:</td><td style=\"padding: 8px 0; font-weight: 500;\">" + order.getShippingAddress() + "</td></tr>"
                    + "<tr><td style=\"padding: 8px 0; color: #666;\">Thanh toán:</td><td style=\"padding: 8px 0; font-weight: 500;\">" + order.getPaymentMethod() + " (" + order.getPaymentStatus() + ")</td></tr>"
                    + "</table>"

                    + "<h3 style=\"color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;\">Chi tiết đơn hàng</h3>"
                    + "<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">"
                    + itemsHtml.toString()
                    + "</table>"
                    
                    + "<div style=\"background-color: #fcfcfc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee;\">"
                    + "<div style=\"display: flex; justify-content: space-between; margin-bottom: 10px;\"><span>Tạm tính:</span><strong>" + currencyFormat.format(order.getTotalAmount().add(order.getDiscountAmount() != null ? order.getDiscountAmount() : java.math.BigDecimal.ZERO)) + "</strong></div>"
                    + "<div style=\"display: flex; justify-content: space-between; margin-bottom: 10px;\"><span>Giảm giá:</span><strong>-" + currencyFormat.format(order.getDiscountAmount() != null ? order.getDiscountAmount() : java.math.BigDecimal.ZERO) + "</strong></div>"
                    + "<div style=\"display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 10px; font-size: 18px;\"><span><strong>Tổng cộng:</strong></span><strong style=\"color: #ff0000;\">" + currencyFormat.format(order.getTotalAmount()) + "</strong></div>"
                    + "</div>"
                    
                    + "<div style=\"text-align: center;\">"
                    + "<a href=\"http://localhost:3000\" style=\"display: inline-block; background-color: #ff0000; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 14px;\">Tiếp tục mua sắm</a>"
                    + "</div>"
                    
                    + "</div>"
                    + "<div style=\"text-align: center; margin-top: 40px; font-size: 13px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px;\">"
                    + "<p style=\"margin: 0 0 5px 0;\">Email này được gửi tự động từ hệ thống Website PhoneStore.</p>"
                    + "<p style=\"margin: 0;\">&copy; 2025 Phone Store. All rights reserved.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            
            // Add inline images after setting text
            for (Map.Entry<String, byte[]> entry : inlineImages.entrySet()) {
                String cid = entry.getKey();
                byte[] data = entry.getValue();
                String contentType = inlineContentTypes.get(cid);
                helper.addInline(cid, new ByteArrayResource(data), contentType);
            }
            
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    

    public void sendContactReplyEmail(String toEmail, String customerName, String originalContent, String replyContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("giabaolesag@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Phản hồi liên hệ từ PhoneStore - Chăm sóc khách hàng");
            
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background-color: #ffffff;\">"
                    + "<div style=\"text-align: center; border-bottom: 2px solid #ff0000; padding-bottom: 25px; margin-bottom: 30px;\">"
                    + "<h1 style=\"color: #ff0000; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-size: 30px;\">PHONE STORE</h1>"
                    + "<p style=\"color: #777; margin: 10px 0 0 0; font-size: 15px;\">Hệ thống bán lẻ điện thoại di động uy tín, chất lượng</p>"
                    + "</div>"
                    + "<div style=\"color: #333; line-height: 1.7;\">"
                    + "<h2 style=\"color: #111; font-size: 22px; margin-top: 0;\">Xin chào <strong>" + customerName + "</strong>,</h2>"
                    + "<p style=\"font-size: 16px; margin-bottom: 15px; color: #444;\">Lời đầu tiên, PhoneStore xin gửi lời chào trân trọng và cảm ơn chân thành nhất đến bạn vì đã tin tưởng, lựa chọn liên hệ với dịch vụ Chăm sóc khách hàng của chúng tôi.</p>"
                    + "<p style=\"font-size: 16px; margin-bottom: 25px; color: #444;\">Chúng tôi luôn trân trọng mọi ý kiến đóng góp cũng như các câu hỏi của khách hàng để không ngừng nâng cao chất lượng dịch vụ. Liên quan đến vấn đề bạn đã đề cập, PhoneStore xin phép được phản hồi chi tiết như sau:</p>"
                    + "<div style=\"background-color: #fff8f8; padding: 25px; border-left: 5px solid #ff0000; border-radius: 0 10px 10px 0; margin: 25px 0; box-shadow: 0 2px 8px rgba(255,0,0,0.05);\">"
                    + "<h4 style=\"margin-top: 0; margin-bottom: 15px; color: #ff0000; font-size: 15px; text-transform: uppercase; letter-spacing: 1.5px;\">Phản hồi từ chuyên viên CSKH:</h4>"
                    + "<p style=\"margin: 0; white-space: pre-wrap; color: #222; font-size: 16px; line-height: 1.8;\">" + replyContent + "</p>"
                    + "</div>"
                    + "<div style=\"background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #eee;\">"
                    + "<h4 style=\"margin-top: 0; margin-bottom: 10px; color: #666; font-size: 14px; text-transform: uppercase;\">Nội dung liên hệ ban đầu của bạn:</h4>"
                    + "<p style=\"margin: 0; white-space: pre-wrap; color: #555; font-size: 15px; line-height: 1.6; font-style: italic;\">\"" + originalContent + "\"</p>"
                    + "</div>"
                    + "<p style=\"font-size: 16px; margin-top: 30px; color: #444;\">Hy vọng câu trả lời trên đã giải đáp được thắc mắc của bạn. Nếu bạn cần hỗ trợ hoặc tư vấn thêm bất cứ thông tin gì, xin đừng ngần ngại trả lời trực tiếp email này hoặc liên hệ ngay với chúng tôi qua:</p>"
                    + "<ul style=\"color: #444; font-size: 16px; line-height: 1.8; margin-bottom: 30px;\">"
                    + "<li><strong>Hotline CSKH:</strong> <span style=\"color: #ff0000; font-weight: bold;\">1900 1234</span> (Miễn phí cuộc gọi)</li>"
                    + "<li><strong>Email:</strong> support@phonestore.com</li>"
                    + "<li><strong>Website:</strong> www.phonestore.com</li>"
                    + "</ul>"
                    + "<p style=\"font-size: 16px; color: #444;\">Một lần nữa, cảm ơn bạn đã đồng hành cùng PhoneStore. Chúc bạn có một ngày làm việc thật vui vẻ và hiệu quả!</p>"
                    + "<p style=\"font-size: 16px; font-weight: bold; margin-top: 30px; color: #222;\">Trân trọng,<br><span style=\"color: #ff0000;\">Đội ngũ CSKH PhoneStore</span></p>"
                    + "</div>"
                    + "<div style=\"text-align: center; margin-top: 40px; font-size: 13px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px;\">"
                    + "<p style=\"margin: 0 0 5px 0;\">Email này được gửi tự động từ hệ thống Website PhoneStore.</p>"
                    + "<p style=\"margin: 0;\">&copy; 2025 Phone Store. All rights reserved.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
