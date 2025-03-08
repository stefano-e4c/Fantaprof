package com.minegolem.fantaprof.repository;

import com.minegolem.fantaprof.repository.database.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
}
