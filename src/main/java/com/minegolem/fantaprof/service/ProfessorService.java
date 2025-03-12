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
}
