package com.minegolem.fantaprof.repository.database;

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
@Table(name = "professors")
public class Professors {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private int cost;

    private int points;

    public Professors(String name, int cost, int points) {
        this.name = name;
        this.cost = cost;
        this.points = points;
    }
}
