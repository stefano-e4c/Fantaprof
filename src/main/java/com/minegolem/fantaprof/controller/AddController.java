package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.repository.database.Professor;
import com.minegolem.fantaprof.service.ProfessorService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

@Controller
@AllArgsConstructor
@RequestMapping("/add")
public class AddController {

    private final ProfessorService professorService;

    private final LinkedHashMap<String, Integer> dataMap = new LinkedHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public String add(Model model) {
        List<Professor> professorsList = professorService.getAllProfessors();
        model.addAttribute("professors", professorsList);

        // BONUS
        dataMap.put("Assenza", +20);
        dataMap.put("Area Relax", +30);
        dataMap.put("Parolaccia", +30);
        dataMap.put("Gergo Giovanile", +15);
        dataMap.put("Scrive alla Lavagana", +5);
        dataMap.put("Correzione immediata", +5);
        dataMap.put("Malore in classe", +200);
        dataMap.put("Complimento", +10);
        dataMap.put("Pc Sabotato", +5);
        dataMap.put("Inciampa o cade", +20);
        dataMap.put("Fa vedere un video", +15);
        dataMap.put("Risata", +10);
        dataMap.put("Esercitazione", +20);
        dataMap.put("Veste monocromo", +10);
        dataMap.put("Si litiga con un prof", +100);
        dataMap.put("Si litiga con un alunno", +50);
        dataMap.put("Meme", +10);
        dataMap.put("Divulgatore d'oro", +20);
        dataMap.put("Prof influencer", +5);
        dataMap.put("Empatia", +20);
        dataMap.put("Esce durante verifica", +15);
        dataMap.put("Nota di merito", +35);
        dataMap.put("Capriola", +150);
        dataMap.put("Dimentica le verifiche il giorno del compito", +30);
        dataMap.put("Caccia nota", +25);
        dataMap.put("Mette 10", +50);

        // Malus
        dataMap.put("Sbaglia", -10);
        dataMap.put("Arriva tardi", -10);
        dataMap.put("Fissa verifiche giorno dopo", -15);
        dataMap.put("Battuta boomer", -15);
        dataMap.put("Mette nota", -30);
        dataMap.put("Dimentica Verifiche", -20);
        dataMap.put("Vestiti a pois", -5);
        dataMap.put("Assenza con supplente", -10);
        dataMap.put("Insulta o prende in giro", -10);
        dataMap.put("Mette ritardo", -5);
        dataMap.put("Mette ritardo di pochi minuti", -20);
        dataMap.put("Fuoriclasse", -5);
        dataMap.put("Bagno abolito", -15);
        dataMap.put("Nota Ingiusta", -30);
        dataMap.put("Se la memoria non mi inganna", -5);
        dataMap.put("Total Black", -10);
        dataMap.put("Ritira tel", -15);
        dataMap.put("Rompe qualcosa", -20);
        dataMap.put("Non mette la nota a zic", -100);

        model.addAttribute("dataMap", dataMap);

        return "add";
    }
}
