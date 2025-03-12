package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.repository.database.Professor;
import com.minegolem.fantaprof.repository.database.Team;
import com.minegolem.fantaprof.service.ProfessorService;
import com.minegolem.fantaprof.service.TeamService;
import com.minegolem.fantaprof.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;

@Controller
@AllArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final ProfessorService professorService;
    private final UserService userService;

    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/creasquadra")
    public String creaTeam(Model model) {
        List<Professor> professorsList = professorService.getAllProfessors();
        model.addAttribute("professors", professorsList);
        return "CreaSquadra";
    }

    @GetMapping("/team")
    public String team(Model model) {
        Long userId = userService.getUserByUsername(getCurrentUsername()).getId();

        String teamName = teamService.findNameByUserId(userId);

        List<Professor> professorsList = teamService.getTeamProfessors(userId);

        Long teamCaptain = teamService.getTeam(userId).stream()
                .filter(Team::isCaptain)
                .map(Team::getProfId)
                .findFirst()
                .orElse(null);

        if (teamName == null || teamName.isBlank()) {
            model.addAttribute("professors", professorsList);
            return "team";
        }

        model.addAttribute("professors", professorsList);
        model.addAttribute("teamName", teamName);

        int totalScore = professorsList.stream()
                .mapToInt(professor -> {
                    if (professor.getId().equals(teamCaptain)) {
                        return professor.getScore() * 2;
                    } else {
                        return professor.getScore();
                    }
                })
                .sum();
        model.addAttribute("totalScore", totalScore);
        model.addAttribute("teamCaptain", teamCaptain);

        return "team";
    }


    @PostMapping("/api/team/add")
    public String addTeam(@RequestParam("name") String name,
                          @RequestParam("selectedItems") List<Long> selectedItems,
                          @RequestParam("capitanoId") String capitanoId,
                          Model model) {

        Long captainId = Long.valueOf(capitanoId.replaceAll("capitano_", "").replaceAll(",", ""));

        Long userId = userService.getUserByUsername(getCurrentUsername()).getId();

        selectedItems.forEach(item -> {
            Team team = new Team(name, userId, item, captainId.equals(item));
            teamService.addTeam(team);
        });

        messagingTemplate.convertAndSend("/topic/orders/creaSquadra", "ok");

        return "redirect:/creasquadra";
    }

    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getName();
        }
        return null;
    }
}
