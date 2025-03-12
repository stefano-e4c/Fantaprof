package com.minegolem.fantaprof.controller;

import com.minegolem.fantaprof.repository.database.User;
import com.minegolem.fantaprof.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@AllArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/add")
    public String addUser(@RequestParam("username") String username,
                               @RequestParam("password") String password) {

        User user = new User(username, password, 0L, "USER");

        userService.registerUser(user);

        return "redirect:../.././add";
    }
}
