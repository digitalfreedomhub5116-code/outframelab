// Realistic Indian casual English reviews
// STRICT RULES: NO hyphens (-), NO commas (,), NO periods (.)
// Includes positive reviews and 1 to 5 critical/bad reviews

export const REVIEWS_POOL = {
  // Common positive Indian casual reviews
  positive: [
    { name: "Aarav Sharma", text: "bhai quality is genuinely crazy heavy solid metal looks so sick on my bullet keys" },
    { name: "Rohan Nair", text: "yaar antique gold finish is top tier looks 10x better than pictures" },
    { name: "Kunal Verma", text: "received in 3 days packaging was luxury level brother loved it" },
    { name: "Aditya Patel", text: "proper solid brass feel not that cheap plastic stuff totally worth 499" },
    { name: "Siddharth Rao", text: "looks unreal in person everyone in college is asking where i got it" },
    { name: "Varun Malhotra", text: "insane detailing on the metal proper heavy antique finish" },
    { name: "Pranav Iyer", text: "super happy with the purchase looks dope on my car key" },
    { name: "Ankit Deshmukh", text: "bro this is next level stuff finishing is so clean" },
    { name: "Devendra Joshi", text: "mast product hai worth every single rupee" },
    { name: "Harshit Sen", text: "fast delivery and solid build quality will buy more" },
    { name: "Nikhil Kulkarni", text: "gold patina looks so authentic feels like actual antique piece" },
    { name: "Gautam Mehta", text: "gifted to my brother he went crazy seeing this" },
    { name: "Suraj Yadav", text: "solid weight to it looks very classy and premium" },
    { name: "Manish Reddy", text: "metal detailing is sharp and clean feels heavy in pocket" },
    { name: "Vivek Choudhary", text: "proper antique vibe loving the solid feel on my bike keys" },
  ],

  // Specific positive reviews per genre
  genreSpecific: {
    MARVEL: [
      { name: "Kabir Roy", text: "iron man arc detailing is so clean proper stark tech look" },
      { name: "Tushar Bansal", text: "spiderman web design popping out looks fire in real" },
      { name: "Aakash Pandey", text: "thor hammer finish is heavy and feels like real mjolnir metal" },
      { name: "Rahul Saxena", text: "captain shield edge is sharp looks amazing on my car keys" },
    ],
    DC: [
      { name: "Yashwant Singhania", text: "batarang shape is lethal looks damn menacing in antique gold" },
      { name: "Karan Johar", text: "superman shield looks royal properly detailed metal" },
      { name: "Rishi Kapoor", text: "gotham dark knight vibe is 100 percent there" },
    ],
    CARS: [
      { name: "Armaan Malik", text: "porsche rear wing profile is crazy accurate car guys will love this" },
      { name: "Dhruv Mittal", text: "bmw grill cut is so sharp perfect companion for my car keys" },
      { name: "Sanjay Singhal", text: "mustang silhouette looks aggressive in antique gold" },
      { name: "Sameer Merchant", text: "ferrari curve is beautiful proper heavy metallic piece" },
    ],
    VALORANT: [
      { name: "Reyansh Bhatt", text: "jett blade storm kunai looks just like in game clutch finish" },
      { name: "Ayush Khurana", text: "reyna eye detailing has wicked dark gold vibe" },
      { name: "Shubham Gill", text: "sage orb emblem is clean radiant rank keychain" },
      { name: "Tanmay Bhatia", text: "chamber card aesthetic is rich and classy" },
    ],
    ANIME: [
      { name: "Chirag Agrawal", text: "naruto kunai formula carved so well anime fans must buy" },
      { name: "Mohit Chauhan", text: "luffy gear silhouette is legendary one piece fans go for it" },
      { name: "Abhishek Nambiar", text: "gojo infinite void seal looks majestic in gold" },
      { name: "Ritvik Sen", text: "sukuna fingers motif is dark and crazy cool" },
      { name: "Naveen Prasad", text: "ichigo bankai sword guard looks super authentic" },
    ],
  },

  // Realistic bad / critical reviews (NO hyphens, commas, periods)
  critical: [
    { name: "Deepak Mehra", rating: 2, text: "delivery guy took 5 days to deliver courier service was very slow" },
    { name: "Saurabh Tiwari", rating: 3, text: "key ring was bit tight took time to insert my bike key" },
    { name: "Mayank Mishra", rating: 2, text: "size is little smaller than what i imagined from photos quality is okay though" },
    { name: "Chetan Bhagat", rating: 3, text: "outer box had small dent while shipping keychain was safe inside" },
    { name: "Anand Ahuja", rating: 2, text: "took almost a week to reach bangalore delivery service need improvement" },
    { name: "Pankaj Tripathi", rating: 3, text: "wish the ring chain was little bit longer otherwise metal finish is good" },
  ],
}
