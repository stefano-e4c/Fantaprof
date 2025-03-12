package com.minegolem.fantaprof.repository.database;

import com.minegolem.fantaprof.repository.converter.UserBase64Converter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Long userId;
    private Long profId;
    private boolean captain;

    public Team(String name, Long userId, Long profId, boolean captain) {
        this.name = name;
        this.userId = userId;
        this.profId = profId;
        this.captain = captain;
    }
}
