package com.minegolem.fantaprof.service;

import com.minegolem.fantaprof.repository.ProfessorsRepository;
import com.minegolem.fantaprof.repository.database.Professors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ProfessorService {

    private final ProfessorsRepository repository;

    public void addProfessor(Professors professor) {
        repository.save(professor);
    }

    public List<Professors> getAllProfessors() {
        return repository.findAll();
    }

    public void deleteProfessor(Long uuid) {
        repository.deleteById(uuid);
    }
}
