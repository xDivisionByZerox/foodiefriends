# Foodie Friends

Foodie Friends is a platform that brings people together based on their shared love for good food. Discover, connect, and meet up with like-minded individuals who appreciate the same restaurants and culinary experiences.

#### Website URL:
https://foodiefriends.online/

## Table of Contents

- [Features](#features)
- [Techniques](#techniques)
- [Demo](#demo)

- [Architecture and Deployment Details](#architecture-and-deployment-details)


## Features

1. **Restaurant Matching:**
   - Discover users with similar taste preferences in restaurants through algorithmic matching method.

2. **User Profiles:**
   - Create a personalized profile showcasing favorite restaurants and culinary preferences.
   - View detailed profiles of potential matches to find compatibility beyond food preferences.

3. **Swiping Mechanism:**
   - Implement a swiping mechanism for users to browse through profiles. Users can express interest by clicking to swipe right or skip by swiping left, vice versa, creating a gamified and engaging experience.

4. **Integration with Maps:**
    - Utilized Google Maps API for detailed place searches

## Techniques

- **Node.js Backend and RESTful API**: 
   - Experienced in leveraging **Node.js** and **express.js** to construct backend systems, specializing in the development of **RESTful APIs** to ensure the efficiency and scalability of web applications.

- **Recommendation System**: 
   - Implement a **Collaborative Filtering algorithm** to enable users to find like-minded individuals with similar restaurant tastes.
  
- **Database Management**:
  - Utilize **MySQL** and **Amazon Relational Database Service (RDS)** for a reliable and scalable database storage.
  - Implemented third normal form in the database to optimize data organization and enhance efficiency. 
  - Employed indexing to enhance database query performance.

- **Unit Testing with Jest**:
  - Implement **Jest** for unit testing the user authentication route to ensure the reliability of the authentication process.

- **User Authentication**:
  - Utilized user authentication and validation through **JSON Web Tokens (JWT)**, maintaining secure and reliable access control for web applications.

- **Containerization with Docker**:
  - Containerized the application using **Docker** and deploy through **AWS EC2**.

## Demo
- **Entering Personal Information and Selecting Favorite Restaurants**: 
   - Users fill out basic information to meet essential criteria and select restaurants to match with people who share similar tastes.

- **Recommendation System**: 
   - Implement a **Collaborative Filtering algorithm** to enable users to find like-minded individuals with similar restaurant tastes.
  

## Architecture and Deployment Details

- **Entity Relationship Diagram (ERD)**: 
<p align="center">
  <img src="https://github.com/ChennXIao/foodiefriends/assets/61040179/c8db8105-f36a-4082-8390-480bd95bed1e" alt="fdErd">
</p>

- **Server Architecture**: 
<p align="center">
  <img src="https://github.com/ChennXIao/foodiefriends/assets/61040179/da8eba48-d297-4164-bb08-92776add9d82" alt="system_design">
</p>


