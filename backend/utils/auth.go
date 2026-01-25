// Package utils
package utils

import "golang.org/x/crypto/bcrypt"

func GeneratePassword(passwordStr string) ([]byte, error) {
	password, err := bcrypt.GenerateFromPassword([]byte(passwordStr), 14)
	if err != nil {
		return nil, err
	}

	return password, nil
}
