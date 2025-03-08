package com.minegolem.fantaprof.repository;

import com.minegolem.fantaprof.repository.database.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}