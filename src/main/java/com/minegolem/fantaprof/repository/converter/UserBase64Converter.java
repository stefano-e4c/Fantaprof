package com.minegolem.fantaprof.repository.converter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minegolem.fantaprof.repository.database.User;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Base64;

@Converter(autoApply = true)
public class UserBase64Converter implements AttributeConverter<User, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(User user) {
        try {
            if (user == null) {
                return null;
            }
            // Serializza l'oggetto in JSON
            String json = objectMapper.writeValueAsString(user);
            // Codifica in Base64
            return Base64.getEncoder().encodeToString(json.getBytes());
        } catch (Exception e) {
            throw new RuntimeException("Errore nella serializzazione dell'utente", e);
        }
    }

    @Override
    public User convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isEmpty()) {
                return null;
            }
            // Decodifica da Base64
            String json = new String(Base64.getDecoder().decode(dbData));
            // Deserializza in User
            return objectMapper.readValue(json, User.class);
        } catch (Exception e) {
            throw new RuntimeException("Errore nella deserializzazione dell'utente", e);
        }
    }
}

