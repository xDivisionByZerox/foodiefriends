const { decodeFromToken } = require('../controllers/userController');
const PairModel = require('../models/pairModel');
const RestaurantModel = require('../models/restaurantModel');

const _ = require("lodash");
var similarity = require( 'compute-cosine-similarity' );


const PairController = {
    makePair: (req, res) => {
        const { USERA, USERB, restaurant, date, time, timestamp } = req.body;

        try {
            PairModel.ifPairExist(USERB, USERA, (err, results) => {
                if (err) {
                    throw err;
                }

                console.log(results);

                if (_.isEmpty(results)) {
                    PairModel.createPair(USERA, USERB, restaurant, date, time, timestamp, false, (err, results) => {
                        if (err) {
                            console.error('Error creating Pair:', err);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            console.log('Pair created successfully:', results);
                            res.status(200).json({ ok: true });
                        }
                    });
                } else {
                    // Change to false
                    PairModel.updatePair(USERB, USERA, false, (err, results) => {
                        if (err) {
                            console.error('Error updating Pair:', err);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            console.log('Match updated successfully:', results);
                            res.status(200).json({ ok: true });
                        }
                    });
                }
            });
        } catch (error) {
            res.status(500).json({ error: true, message: 'Internal Server Error' });
        }
    },
    updatePair:(req, res)=>{
        const { USERA, USERB } = req.body;
        try {

        PairModel.updatePair(USERA,USERB,true,(err,results)=>{

            if (err) {
                console.error('Error creating filter:', err);
                return res.status(204).json({ error: 'Internal Server Error' });
              }
          
              console.log('Filter updated successfully:', results);
              res.status(200).json({ ok: true });
            });
        } catch (error) {
            res.status(500).json({ error: true, message: 'internal server error' });
        }

    },    
    checkPair: (req, res) => {
        let userID = decodeFromToken(req);
    
        try {
            PairModel.getPairs(userID, (err, results) => {
                if (err) {
                    throw err;
                }
    
                let response = { data: [] };
    
                if (_.isEmpty(results)) {
                    res.status(200).json({ message: "Cannot find any pairs for the user" });
                } else {
                    results.forEach((element) => {
                        response.data.push({
                            gender: element.gender,
                            member: element.nickname,
                            name: element.name,
                        });
                    });
    
                    res.status(200).json(response);
                }
            });
        } catch (error) {
            res.status(500).json({ error: true, message: 'internal server error' });
        }
    },
    
    getLikedRestaurant: (req, res) => {
        let userID = decodeFromToken(req);
    
        try {
            RestaurantModel.LikedRestaurant(userID, (err, results) => {
                if (err) throw err
    
                if (_.isEmpty(results)) {
                    res.status(204).json({ message: 'No restaurant data found for the user' });
                } else {
                    console.log(`Member ${userID}'s filter is found: `, results);
                    res.status(200).json({ ok: true, results });
                }
            });
        } catch (error) {
            res.status(500).json({ error: true, message: 'internal server error' });
        }
    }, 
    getMatches:(req, res)=>{
        // const { nickname, gender, personality,birthday } = req.body;
        let userID = decodeFromToken(req)
        let response={"data":[]}
        //change to false easily display 
        try{
        PairModel.ifMatched(false,userID,(err,results)=>{

            if (err) throw err
            if(_.isEmpty(results)){
                response.data = null

                return res.status(200).json(response);

            }else{
                results.forEach(e=>{
                    console.log(e)
                    if(userID == e.USERA){
                    response.data.push({id:e.id,user:e.USERB,date:e.date,time:e.time,timestamp:e.timestamp,restaurant:e.restaurant})
                    }else{
                        response.data.push({id:e.id,user:e.USERA,date:e.date,time:e.time,timestamp:e.timestamp,restaurant:e.restaurant})

                    }
                }
                )

            }
              console.log(`Member ${userID}'s matches is found: `, results);
              res.status(200).json(response);
        })
    }catch (error) {
        res.status(500).json({ error: true, message: 'internal server error' });
    }
},    
    cancelDate: async (req, res) => {
        const cancelId = req.params.id;
        // let userID = decodeFromToken(req);
    
        try {
                await new Promise((resolve, reject) => {
                    PairModel.cancelDate(cancelId, (err, results) => {
                        if (err) {
                            console.error('Error cancel match:', err);
                            reject(err);
                        } else {
                            console.log('Match cancel successfully:', results);
                            resolve(results);
                        }
                    });
                });
    
            res.status(200).json({ ok: true });
        } catch (error) {
            res.status(500).json({ error: true, message: 'internal server error' });
        }
    },


}
module.exports = PairController;

// //make a user
// class User {
//     //set profile info
//     constructor(id, name, age, gender, relationshipPreference) {
//       this.id = id;
//       this.name = name;
//       this.age = age;
//       this.gender = gender;
//       this.relationshipPreference = relationshipPreference;
//     //   this.diet = diet;
//       this.likedRestaurants = new Set();
//     }
    
//     //User who like restaurant what
//     likeRestaurant(restaurant) {
//       this.likedRestaurants.add(restaurant);
//       console.log(`${this.name} likes ${restaurant}`);
//     }
//   }
  
//   class Matchmaker {
//     constructor() {
//       this.users = [];
//       this.userItemMatrix = [];
//     }

//     //add user into user pool
//     addUser(id, name, age, gender, relationshipPreference,diet) {
//       const newUser = new User(id, name, age, gender, relationshipPreference);
//       this.users.push(newUser);
//       return newUser;
//     }
  
//     likeRestaurant(userId, restaurant) {
//       const user = this.users.find(user => user.id === userId);
//       console.log( user)

//       if (user) {
//         user.likeRestaurant(restaurant);
//       }
//     //   console.log( this.users[2],"oooooooooo")

//     }
  
//     createUserItemMatrix() {
//         // intergrate all current restaurants 
//       const restaurants = Array.from(
//         new Set(this.users.flatMap(user => Array.from(user.likedRestaurants)))
//       );
//       console.log(restaurants,":::::::::")

//       this.userItemMatrix = this.users.map(user => {
//         const userRow = restaurants.map(restaurant =>
//           user.likedRestaurants.has(restaurant) ? 1 : 0
//         );
//         console.log(userRow)
//         return userRow;
//       });
  
//     //   console.log('User-Item Matrix:', this.userItemMatrix);
//     }
  
//     calculateCosineSimilarity(userA, userB) {

//         const idA = userA.id;
//         const idB = userB.id;
//         var s = similarity( this.userItemMatrix[idA-1], this.userItemMatrix[idB-1]);
//         return s;
//       }
//     calculateCollaborativeFiltering(userId) {
//       const currentUser = this.users.find(user => user.id === userId);
//       console.log(currentUser)
  
//       if (!currentUser) {
//         console.log('User not found.');
//         return [];
//       }

//           // Filter potential matches based on profile criteria
//     const potentialMatches = this.users.filter(user => {
//       const isAgeMatch = Math.abs(currentUser.age - user.age) <= 5; // Adjust as needed
//       const isGenderMatch = currentUser.gender === user.relationshipPreference;
//       const isRelationshipMatch = currentUser.relationshipPreference === user.gender;

//       return isAgeMatch && isGenderMatch && isRelationshipMatch;
//     });
//     console.log(potentialMatches,"================================")
  
//       const similarities = potentialMatches.slice(1,10).map(user => ({
//         userId: user.id,
//         gender : user.gender,
//         age: user.age,
//         // res : user.likedRestaurants,

//         similarity: this.calculateCosineSimilarity(currentUser, user),
//       }));
      
//       // Sort users based on similarity (descending order)
//       similarities.sort((a, b) => b.similarity - a.similarity);
//       console.log(similarities)

//       // Recommend restaurants from the most similar user that currentUser hasn't liked
//       const recommendedRestaurants = [];
//       const mostSimilarUsers = similarities.slice(0,5).map(similarity => {
//         return this.users.find(user => user.id === similarity.userId);
//       });
//             console.log(mostSimilarUsers,"[][][][][][][][")

//             mostSimilarUsers.map(perUser =>{
//               perUser.likedRestaurants.forEach(restaurant => {
//                 if (currentUser.likedRestaurants.has(restaurant)) {
//                     //
//                     // console.log(restaurant)
        
//                 }else{
//                     recommendedRestaurants.push({ userId: perUser.id, restaurant });
//                 }
//               });
//             })
 
//       const trans = recommendedRestaurants.reduce((result, item) => {
//         const { userId, restaurant } = item;
      
//         if (!result[userId]) {
//           result[userId] = { userId, restaurant: [restaurant] };
//         } else {
//           result[userId].restaurant.push(restaurant);
//         }
      
//         return result;
//       }, {});
      
//       // Convert the object values back to an array
//       const resultArray = Object.values(trans);
      
//       console.log(resultArray);
//       return resultArray;
//     }
//   }

//   // Example usage
//   const matchmaker = new Matchmaker();


  // Example usage

  // const userA = matchmaker.addUser(1, 'UserA', 40, 'Male', 'Female');
  // matchmaker.likeRestaurant(1, 'RestaurantA');
  // matchmaker.likeRestaurant(1, 'RestaurantD');
  // matchmaker.likeRestaurant(1, 'RestaurantC');
  
  // const userB = matchmaker.addUser(2, 'UserB', 41, 'Female', 'Male');
  // matchmaker.likeRestaurant(2, 'RestaurantA');
  // matchmaker.likeRestaurant(2, 'RestaurantF');
  // matchmaker.likeRestaurant(2, 'RestaurantK');
  // matchmaker.likeRestaurant(2, 'RestaurantB');

  // const userC = matchmaker.addUser(3, 'UserC', 30, 'Male', 'Female');
  // matchmaker.likeRestaurant(3, 'RestaurantA');
  // matchmaker.likeRestaurant(3, 'RestaurantC');
  // matchmaker.likeRestaurant(3, 'RestaurantE');
  // const userD = matchmaker.addUser(4, 'UserD', 25, 'Male', 'Female');
  // matchmaker.likeRestaurant(4, 'RestaurantL');
  // matchmaker.likeRestaurant(4, 'RestaurantE');
  // matchmaker.likeRestaurant(4, 'RestaurantF');
  // matchmaker.likeRestaurant(4, 'RestaurantB');

  // const userE = matchmaker.addUser(5, 'UserE', 20, 'Male', 'Female');
  // matchmaker.likeRestaurant(5, 'RestaurantA');
  // matchmaker.likeRestaurant(5, 'RestaurantF');
  // matchmaker.likeRestaurant(5, 'RestaurantX');
  // const userF = matchmaker.addUser(6, 'UserF', 23, 'Female', 'Male');
  // matchmaker.likeRestaurant(6, 'RestaurantD');
  // matchmaker.likeRestaurant(6, 'RestaurantC');
  // matchmaker.likeRestaurant(6, 'RestaurantK');
  // matchmaker.likeRestaurant(6, 'RestaurantB');

  // Duplicate the structure for 100 users
// for (let i = 0; i <= 100; i++) {
//     const userName = `User${String.fromCharCode(65 + i - 7)}`; // A, B, C, ...
//     const userAge = Math.floor(Math.random() * 20) + 20; // Random age between 20 and 40
//     const userGender = Math.random() < 0.5 ? 'Male' : 'Female'; // Randomly assign gender
//     const relationshipPreference = userGender === 'Male' ? 'Female' : 'Male'; // Opposite gender preference
  
//     const newUser = matchmaker.addUser(i, userName, userAge, userGender, relationshipPreference);
  
//     // Simulate some likes for each user
//     const likedRestaurants = ['RestaurantA', 'RestaurantB', 'RestaurantC', 'RestaurantD', 'RestaurantE','RestaurantF', 'RestaurantG', 'RestaurantH', 'RestaurantI', 'RestaurantP'];
//     const numLikes = Math.floor(Math.random() * likedRestaurants.length) + 1; // Random number of likes (1 to 5)
    
//     for (let j = 0; j < numLikes; j++) {
//       const randomIndex = Math.floor(Math.random() * likedRestaurants.length);
//       const likedRestaurant = likedRestaurants[randomIndex];
//       matchmaker.likeRestaurant(i, likedRestaurant);
//     }
//   }

  
  
//   matchmaker.createUserItemMatrix();
//   const userId = 2;
//   const collaborativeRecommendations = matchmaker.calculateCollaborativeFiltering(3);
  
//   console.log('Collaborative Filtering Recommendations for UserC:', collaborativeRecommendations);
  
