package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.repository.database.Professors;
import com.minegolem.fantaprof.service.ProfessorService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@AllArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final ProfessorService professorService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/add")
    public String addProfessor(@RequestParam("name") String name,
                               @RequestParam("cost") int cost,
                               Model model) {

        Professors professor = new Professors(name, cost, 0);

        model.addAttribute("professor", professor);
        professorService.addProfessor(professor);

        messagingTemplate.convertAndSend("/topic/orders/save", name);

        return "redirect:../.././add";
    }

    @DeleteMapping("/delete/{id}")
    public String deleteOrder(@PathVariable Long id) {
        professorService.deleteProfessor(id);

        messagingTemplate.convertAndSend("/topic/orders/delete", id);

        return "redirect:../.././add";
    }
}
