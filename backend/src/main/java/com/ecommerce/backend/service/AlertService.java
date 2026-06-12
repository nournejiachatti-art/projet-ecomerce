package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AlertService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${alert.email.to}")
    private String alertEmail;

    public AlertService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSecurityAlert(String ip, String email, int failedAttempts) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(alertEmail);
            message.setSubject("[SECURITE] Alerte - Tentatives de connexion suspectes");
            
            String content = String.format(
                "Alerte de sécurité - Force brute détectée\n\n" +
                "Date: %s\n" +
                "IP source: %s\n" +
                "Email ciblé: %s\n" +
                "Nombre de tentatives échouées: %d\n\n" +
                "Action: L'IP a été temporairement bloquée.\n" +
                "Veuillez vérifier les logs si nécessaire.\n\n" +
                "Cordialement,\n" +
                "Système de sécurité ShopEase",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                ip,
                email,
                failedAttempts
            );
            
            message.setText(content);
            mailSender.send(message);
            System.out.println("Alerte email envoyée à: " + alertEmail);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'alerte: " + e.getMessage());
        }
    }
    
    public void sendIpBlockedAlert(String ip, String email, long blockDurationMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(alertEmail);
            message.setSubject("[URGENT] IP bloquée - Attaque par force brute");
            
            String content = String.format(
                "URGENT - Blocage IP pour force brute\n\n" +
                "Date: %s\n" +
                "IP bloquée: %s\n" +
                "Email ciblé: %s\n" +
                "Durée de blocage: %d minutes\n\n" +
                "Cette IP a été automatiquement bloquée après trop de tentatives.\n" +
                "Veuillez vérifier l'activité suspecte.\n\n" +
                "Cordialement,\n" +
                "Système de sécurité ShopEase",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                ip,
                email,
                blockDurationMinutes
            );
            
            message.setText(content);
            mailSender.send(message);
            System.out.println("Alerte blocage IP envoyée à: " + alertEmail);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'alerte: " + e.getMessage());
        }
    }
}