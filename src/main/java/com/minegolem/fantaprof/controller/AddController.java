package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.repository.database.Professors;
import com.minegolem.fantaprof.service.ProfessorService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@AllArgsConstructor
@RequestMapping("/add")
public class AddController {

    private final ProfessorService professorService;

    @GetMapping
    public String add(Model model) {
        List<Professors> professorsList = professorService.getAllProfessors();
        model.addAttribute("professors", professorsList);
        return "add";
    }
}
