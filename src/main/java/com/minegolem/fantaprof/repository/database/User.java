package com.minegolem.fantaprof.repository.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private Long scoreTot;
    private String role;

    public User(String username, String password, Long ScoreTot, String role) {
        this.username = username;
        this.password = password;
        this.scoreTot = ScoreTot;
        this.role = role;
    }
}
