Feature: Booking form validation
  As a visitor
  I want to select a booking session
  So that I can proceed with a booking request

  Scenario: Booking session is selected and OTP request requires an email
    Given I open the booking page
    When I choose the "Graduation" session
    Then the booking summary shows "Graduation"
    When I request an OTP without entering an email address
    Then the email validation message is displayed
