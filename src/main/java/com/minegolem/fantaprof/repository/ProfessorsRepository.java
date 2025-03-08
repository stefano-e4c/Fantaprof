package com.minegolem.fantaprof.repository;

import com.minegolem.fantaprof.repository.database.Professors;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorsRepository extends JpaRepository<Professors, Long> {
}
