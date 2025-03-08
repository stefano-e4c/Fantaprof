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

    @Convert(converter = UserBase64Converter.class)
    @Column(columnDefinition = "TEXT")
    private User user;

    public Team(String name, User user) {
        this.name = name;
        this.user = user;
    }
}
