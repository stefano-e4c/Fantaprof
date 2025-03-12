package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.repository.database.Professor;
import com.minegolem.fantaprof.service.ProfessorService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;


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

        Professor professor = new Professor(name, cost, 0);

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

    @RequestMapping(value = "/modifyscore/{id}/{score}", method = RequestMethod.PUT)
    public String modifyScore(@PathVariable Long id, @PathVariable int score) {
        int currentScore = professorService.getScoreById(id);
        currentScore += score;
        professorService.updateScoreById(id, currentScore);

        messagingTemplate.convertAndSend("/topic/orders/modifyScore", id);
        return id.toString();
    }
}
