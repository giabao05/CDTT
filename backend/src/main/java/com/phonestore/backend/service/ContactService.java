package com.phonestore.backend.service;

import com.phonestore.backend.entity.Contact;
import com.phonestore.backend.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final EmailService emailService;

    public Contact saveContact(String name, String email, String content) {
        Contact contact = Contact.builder()
                .name(name)
                .email(email)
                .content(content)
                .status("UNREAD")
                .createdAt(LocalDateTime.now())
                .build();
        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    public Contact getContactById(Long id) {
        return contactRepository.findById(id).orElseThrow(() -> new RuntimeException("Contact not found"));
    }

    public Contact replyContact(Long id, String replyContent) {
        Contact contact = getContactById(id);
        
        emailService.sendContactReplyEmail(contact.getEmail(), contact.getName(), contact.getContent(), replyContent);
        
        contact.setStatus("REPLIED");
        contact.setReplyContent(replyContent);
        contact.setRepliedAt(LocalDateTime.now());
        
        return contactRepository.save(contact);
    }

    public Contact markAsRead(Long id) {
        Contact contact = getContactById(id);
        if ("UNREAD".equals(contact.getStatus())) {
            contact.setStatus("READ");
            return contactRepository.save(contact);
        }
        return contact;
    }
}
