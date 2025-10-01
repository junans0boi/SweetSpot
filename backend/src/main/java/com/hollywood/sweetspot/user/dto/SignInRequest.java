package com.hollywood.sweetspot.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SignInRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;
}
