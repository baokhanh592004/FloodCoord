package com.team6.floodcoord.utils;

public final class PasswordUtils {
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d).+$";

    private PasswordUtils() {
    }

    public static boolean isValidPassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            return false;
        }
        return password.matches(PASSWORD_PATTERN);
    }

    public static String getPasswordValidationMessage() {
        return "Password must be at least " + MIN_PASSWORD_LENGTH +
                " characters long, include letters and numbers";
    }

}
