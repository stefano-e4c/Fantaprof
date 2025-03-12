package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.service.ProfessorService;
import com.minegolem.fantaprof.service.TeamService;
import com.minegolem.fantaprof.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderBoardController {

    private final TeamService teamService;
    private final ProfessorService professorService;
    private final UserService userService;

    @GetMapping
    public String getLeaderboard(Model model) {
        Map<String, Integer> scoreMap = teamService.getTeamScores();

        // Ordina la classifica per punteggio (decrescente)
        List<Map.Entry<String, Integer>> leaderboard = new ArrayList<>(scoreMap.entrySet());
        leaderboard.sort((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()));

        // Aggiungi la classifica al modello
        model.addAttribute("leaderboard", leaderboard);

        return "leaderboard";
    }
}
