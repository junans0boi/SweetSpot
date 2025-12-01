package com.hollywood.sweetspot.core.domain.user.dto;

import lombok.Getter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Getter
public class SignInRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;
}
