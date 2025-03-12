package com.minegolem.fantaprof.service;

import com.minegolem.fantaprof.repository.ProfessorRepository;
import com.minegolem.fantaprof.repository.database.Professor;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
public class ProfessorService {

    private final ProfessorRepository repository;

    private final Map<Long, LocalDateTime> lastUpdateMap = new ConcurrentHashMap<>();

    public void addProfessor(Professor professor) {
        repository.save(professor);
    }

    public List<Professor> getAllProfessors() {
        return repository.findAll();
    }

    public void deleteProfessor(Long uuid) {
        repository.deleteById(uuid);
    }

    public int getScoreById(Long id) {
        Optional<Professor> professor = repository.findById(id);

        return professor.map(Professor::getScore).orElse(0);
    }

    public void updateScoreById(Long id, int score) {
        Optional<Professor> professor = repository.findById(id);
        professor.ifPresent(value -> {
            value.setScore(score);
            repository.save(value);
        });
    }

    public boolean canUpdateScore(Long professorId) {
        LocalDateTime lastUpdate = lastUpdateMap.get(professorId);
        if (lastUpdate == null) {
            return true; // Se non c'è un timestamp precedente, permette l'aggiornamento
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime midnight = now.toLocalDate().atStartOfDay().plusDays(1); // Prossima mezzanotte
        return now.isAfter(midnight); // Permette l'aggiornamento solo dopo mezzanotte
    }

    public void updateLastUpdateTimestamp(Long professorId) {
        lastUpdateMap.put(professorId, LocalDateTime.now());
    }
}
