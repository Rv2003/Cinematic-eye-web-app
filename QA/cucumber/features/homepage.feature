Feature: Cinematic Eye homepage navigation
  As a visitor
  I want to explore the studio website
  So that I can view its portfolio

  Scenario: Visitor navigates from the homepage to the portfolio
    Given I open the Cinematic Eye home page
    When I click Explore Portfolio
    Then the portfolio work section is visible
