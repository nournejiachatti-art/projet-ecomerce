package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Vérification de votre compte - ShopEase");
            message.setText(String.format(
                "Bonjour,\n\n" +
                "Merci de vous être inscrit sur ShopEase.\n\n" +
                "Votre code de vérification est: %s\n\n" +
                "Ce code expire dans 24 heures.\n\n" +
                "Cordialement,\n" +
                "L'équipe ShopEase",
                verificationCode
            ));
            mailSender.send(message);
            System.out.println("Email de vérification envoyé à: " + to);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi d'email: " + e.getMessage());
            System.out.println("Code de vérification pour " + to + ": " + verificationCode);
        }
    }
    
    public void sendOrderVerificationEmail(String to, String verificationCode, String orderNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Vérification de votre commande - ShopEase");
            message.setText(String.format(
                "Bonjour,\n\n" +
                "Merci pour votre commande !\n\n" +
                "Numéro de commande: %s\n" +
                "Code de vérification: %s\n\n" +
                "Ce code est requis pour valider votre commande.\n\n" +
                "Cordialement,\n" +
                "L'équipe ShopEase",
                orderNumber, verificationCode
            ));
            mailSender.send(message);
            System.out.println("Email de vérification commande envoyé à: " + to);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi d'email: " + e.getMessage());
            System.out.println("Code de vérification pour " + to + ": " + verificationCode);
        }
    }
    
    public void sendOrderConfirmedEmail(String to, String orderNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Commande confirmée - ShopEase");
            message.setText(String.format(
                "Bonjour,\n\n" +
                "Votre commande %s a été confirmée et est en cours de traitement.\n\n" +
                "Vous recevrez une notification dès son expédition.\n\n" +
                "Cordialement,\n" +
                "L'équipe ShopEase",
                orderNumber
            ));
            mailSender.send(message);
            System.out.println("Email de confirmation commande envoyé à: " + to);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi d'email: " + e.getMessage());
        }
    }
}