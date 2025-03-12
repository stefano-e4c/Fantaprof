package com.minegolem.fantaprof.repository;

import com.minegolem.fantaprof.repository.database.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<List<Team>> findByUserId(Long userId);

}
