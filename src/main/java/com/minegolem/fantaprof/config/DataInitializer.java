package com.minegolem.fantaprof.config;

import com.minegolem.fantaprof.repository.UserRepository;
import com.minegolem.fantaprof.repository.database.User;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User("admin", "admin", 0L, "ADMIN");
            userRepository.save(admin);
            log.info("Admin user created: admin/admin");
        }
    }
}
