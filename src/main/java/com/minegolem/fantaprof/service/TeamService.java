package com.minegolem.fantaprof.service;

import com.minegolem.fantaprof.repository.ProfessorRepository;
import com.minegolem.fantaprof.repository.TeamRepository;
import com.minegolem.fantaprof.repository.database.Professor;
import com.minegolem.fantaprof.repository.database.Team;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final ProfessorRepository professorRepository;

    public void addTeam(Team team) {
        teamRepository.save(team);
    }

    public String findNameByUserId(Long userId) {
        List<Team> teams = teamRepository.findByUserId(userId)
                .orElse(new ArrayList<>());

        return teams.isEmpty() ? null : teams.get(0).getName();
    }

    public Map<String, Integer> getTeamScores() {
        List<Team> teams = teamRepository.findAll();
        Map<String, Integer> teamScores = new HashMap<>();

        int totalScore = 0;

        for (Team team : teams) {
            totalScore += professorRepository.findById(team.getProfId())
                    .map(professor -> {
                        if (team.isCaptain()) {
                            return professor.getScore() * 2;
                        } else {
                            return professor.getScore();
                        }
                    }).orElse(0);
        }

        for (Team team : teams) {
            if (!teamScores.containsKey(team.getName())) {
                teamScores.put(team.getName(), totalScore);
            }
        }

        return teamScores;
    }

    public List<Professor> getTeamProfessors(Long userId) {
        List<Team> teamList = teamRepository.findByUserId(userId).orElse(null);

        if (teamList == null) return new ArrayList<>();

        List<Professor> professorList = new ArrayList<>();

        for (Team team : teamList) {
            professorList.add(professorRepository.findById(team.getProfId()).orElse(null));
        }

        return professorList;
    }


    public List<Team> getTeam(Long userId) {
        return teamRepository.findByUserId(userId).orElse(null);
    }

    public boolean hasUserATeam(Long userId) {
        return teamRepository.findByUserId(userId)
                .map(list -> !list.isEmpty())
                .orElse(false);
    }
}
