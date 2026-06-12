package com.ecommerce.backend.model;

public enum OrderStatus {
    PENDING("En attente de vérification"),
    VERIFIED("Vérifié - En traitement"),
    PROCESSING("En cours de préparation"),
    SHIPPED("Expédié"),
    DELIVERED("Livré"),
    CANCELLED("Annulé");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}