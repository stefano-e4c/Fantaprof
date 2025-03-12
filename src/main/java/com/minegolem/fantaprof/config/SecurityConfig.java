package com.minegolem.fantaprof.config;

import com.minegolem.fantaprof.config.filter.TeamFilter;
import com.minegolem.fantaprof.utils.CustomAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.LogoutConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final TeamFilter teamFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(authz -> authz
                    .requestMatchers(
                            "/login",
                            "/register",
                            "/assets/**",  // Permetti accesso ai file statici
                            "/css/**",
                            "/js/**",
                            "/images/**",
                            "/webjars/**",
                            "/ws/**",
                            "/topic/**",
                            "/api/**").permitAll()
                    .requestMatchers("/api/**").hasRole("ADMIN")  // Solo gli utenti con il ruolo "ADMIN" possono accedere
                    .requestMatchers("/add/**").hasAuthority("ROLE_ADMIN")// Permetti l'accesso alla pagina di login e registrazione
                    .anyRequest().authenticated()  // Richiedi l'autenticazione per tutte le altre richieste
            )
            .addFilterBefore(teamFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form
                    .loginPage("/login")  // Imposta la pagina di login personalizzata
                    .loginProcessingUrl("/login") // URL per il login, di default è "/login"
                    .defaultSuccessUrl("/team", true) // Dopo il login, l'utente viene reindirizzato a /home
                    .failureUrl("/login?error=true") // Se il login fallisce, l'utente viene reindirizzato alla stessa pagina con un parametro di errore
                    .permitAll()
            )
            .logout(LogoutConfigurer::permitAll);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .authenticationProvider(customAuthenticationProvider)
                .build();
    }
}
