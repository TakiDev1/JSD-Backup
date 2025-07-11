import { db } from "../server/db";
import { reviews, mods } from "../shared/schema";

async function seedReviews() {
  console.log("Seeding realistic mod reviews...");

  // First, get all mods to add reviews to
  const allMods = await db.select().from(mods);
  
  if (allMods.length === 0) {
    console.log("No mods found to add reviews to. Please add mods first.");
    return;
  }

  // Realistic reviews with common BeamNG mod feedback patterns
  const reviewTemplates = [
    // 5-star reviews
    {
      rating: 5,
      comments: [
        "Easily the best [category] mod I've used in BeamNG. The handling feels exactly like you'd expect, and the attention to detail is incredible. From the dashboard to the engine bay, everything is modeled perfectly. No performance issues at all on my system.",
        
        "Been using this for about a week now and it's become my go-to vehicle for [terrain] driving. The suspension tuning is spot on - not too soft, not too stiff. Visually stunning and performs great even with my mid-range PC. Highly recommended!",
        
        "This is exactly what the game needed. The quality is on par with official content, maybe even better in some areas. The sounds are incredibly detailed - you can hear every little mechanical component working. Worth every penny and then some.",
        
        "JSD has outdone themselves with this one. I was skeptical about the price, but after trying it I can say it's completely justified. The physics model is incredibly detailed - you can feel weight transfer in a way most mods don't capture. And it plays nice with other mods too!",
        
        "The customization options alone make this worth it. So many tuning parts and visual options to choose from! I've spent hours just configuring different setups for various tracks. Performs flawlessly and looks beautiful with realistic reflections on the paint."
      ]
    },
    
    // 4-star reviews
    {
      rating: 4,
      comments: [
        "Really solid [category] mod with great handling characteristics. Textures and model quality are top-notch. Only reason it's not 5 stars is some minor clipping issues with the wheels during extreme compression. Otherwise, it's fantastic.",
        
        "I'm enjoying this mod a lot - it fills a niche that was missing in BeamNG. The driving physics feel authentic and the detail level is impressive. Took off one star because the engine sound could use a bit more depth at high RPM, but that's a minor nitpick.",
        
        "Great addition to my mod collection. Performance is excellent and it looks stunning, especially the interior details. The only small issue is that some of the tuning options seem to have minimal effect on handling. Still definitely recommend it though!",
        
        "Excellent quality overall. The model is beautiful and the physics are well-implemented. I would have given 5 stars but there's a small issue with the brake lights staying on sometimes. Easy workaround is to tap the brake again. Otherwise perfect!",
        
        "Really enjoying this mod. The handling is realistic and challenging in a fun way, and it looks fantastic. Only giving 4 stars because it's a bit demanding on system resources compared to similar mods, but if you have a decent system it's absolutely worth it."
      ]
    },
    
    // 3-star reviews
    {
      rating: 3,
      comments: [
        "Decent mod with good visuals, but the handling feels a bit off. Too much understeer in corners that similar cars wouldn't struggle with. Worth the purchase if you're specifically looking for a [category] vehicle, but there are better options in the same price range.",
        
        "Mixed feelings about this one. The exterior modeling is excellent and the customization options are nice, but the suspension feels too stiff even on the softest settings. Also had some texture glitches on certain parts. It's good, but needs some refinement.",
        
        "It's an okay mod. Looks great in screenshots but performance takes a hit on my system (i5, GTX 1060). The physics are decent though not exceptional. Fair value for the price, but don't expect it to become your favorite vehicle.",
        
        "Middle-of-the-road mod. The good: beautiful model, lots of parts, works without crashing. The bad: sound design is generic, handling feels artificial, and some textures are lower resolution than they should be. Worth it on sale maybe.",
        
        "Some things to like here, some things that need improvement. On the positive side, it's stable and looks pretty good. But the weight distribution feels off, making it too easy to lose control in situations where it shouldn't happen. Has potential with updates."
      ]
    },
    
    // 2-star reviews
    {
      rating: 2,
      comments: [
        "Disappointing for the price. While it looks decent in screenshots, there are numerous issues: texture stretching on certain panels, incorrect collision model causing strange crashes, and the handling is far too twitchy. Needs significant updates.",
        
        "Had high hopes but this falls short. The model itself is okay, but there are serious physics issues - the car bounces unrealistically over small bumps and the tires seem to have almost no grip on standard roads. Not recommended until these are fixed.",
        
        "Below average quality for what JSD usually puts out. Looks rushed with low-res textures in the interior and engine bay. The handling model is simplified compared to their other work too. Wait for updates or a price drop.",
        
        "Not worth the current price. Performance impact is way too high for the quality offered, and there are several visual glitches especially with damage modeling. The sound design is also quite generic and lacks character.",
        
        "Several issues that ruin the experience. Conflicts with other popular mods causing game instability, suspension geometry seems off making the vehicle handle strangely, and some parts are clearly unfinished. Needs more development time."
      ]
    },
    
    // 1-star reviews
    {
      rating: 1,
      comments: [
        "Waste of money in its current state. Constant physics glitches, textures failing to load properly, and it actually crashed my game three times. The model looks decent in screenshots but that doesn't matter if it doesn't work properly.",
        
        "Extremely disappointed. This mod has serious compatibility issues with the latest BeamNG update. The wheels clip through the body, the dashboard is missing textures, and the physics are completely unrealistic. Cannot recommend.",
        
        "Doesn't work as advertised. The customization options shown in the preview aren't actually in the mod, the performance impact is massive even on high-end systems, and the handling is completely broken. Save your money.",
        
        "One of the worst mods I've purchased. Low quality across the board - from boxy, low-poly modeling to generic engine sounds that don't match the vehicle type at all. Feels like something from 5+ years ago, not a premium mod in 2025.",
        
        "Serious issues make this unusable. The collision model is completely wrong causing the vehicle to get stuck on minor obstacles, textures are low resolution, and most disappointingly, the handling feels nothing like a real [category] vehicle should."
      ]
    }
  ];

  // Create a pool of realistic usernames for reviews
  const userIds = Array.from({length: 20}, (_, i) => i + 4); // Starting from ID 4 to avoid admins
  
  // Create a realistic distribution of ratings (skewed toward positive as typical in real stores)
  const ratingDistribution = [
    {rating: 5, weight: 45}, // 45% chance of 5-star
    {rating: 4, weight: 30}, // 30% chance of 4-star
    {rating: 3, weight: 15}, // 15% chance of 3-star
    {rating: 2, weight: 7},  // 7% chance of 2-star
    {rating: 1, weight: 3}   // 3% chance of 1-star
  ];
  
  // Function to select a rating based on distribution
  const selectRating = () => {
    const totalWeight = ratingDistribution.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of ratingDistribution) {
      if (random < item.weight) {
        return item.rating;
      }
      random -= item.weight;
    }
    
    return 5; // Fallback to 5 stars (though this should never happen)
  };
  
  // Generate 2-8 reviews per mod
  const allReviews = [];
  
  for (const mod of allMods) {
    // Determine number of reviews for this mod (2-8)
    const reviewCount = Math.floor(Math.random() * 7) + 2;
    
    // Track used userIds for this mod to avoid duplicate reviews
    const usedUserIds = new Set();
    
    for (let i = 0; i < reviewCount; i++) {
      // Select a user ID that hasn't reviewed this mod yet
      let userId;
      do {
        userId = userIds[Math.floor(Math.random() * userIds.length)];
      } while (usedUserIds.has(userId));
      
      usedUserIds.add(userId);
      
      // Select a rating based on distribution
      const rating = selectRating();
      
      // Find corresponding review template
      const template = reviewTemplates.find(t => t.rating === rating) || reviewTemplates[0];
      
      // Select a random comment from the template
      let comment = template.comments[Math.floor(Math.random() * template.comments.length)];
      
      // Replace placeholders with mod-specific content
      comment = comment.replace('[category]', mod.category || 'vehicle');
      comment = comment.replace('[terrain]', 
        mod.category === 'offroad' ? 'off-road' : 
        mod.category === 'racing' ? 'track' : 
        mod.category === 'drift' ? 'drift' : 'road'
      );
      
      // Create review date (between 1-60 days ago)
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 60) - 1);
      
      // Add to reviews array
      allReviews.push({
        userId,
        modId: mod.id,
        rating,
        comment,
        createdAt: reviewDate,
        updatedAt: reviewDate
      });
    }
  }
  
  // Insert all reviews
  const insertedReviews = await db.insert(reviews).values(allReviews).returning();
  console.log(`Inserted ${insertedReviews.length} realistic reviews`);
  
  // Update average ratings for each mod
  for (const mod of allMods) {
    const modReviews = insertedReviews.filter(review => review.modId === mod.id);
    if (modReviews.length > 0) {
      const averageRating = modReviews.reduce((sum, review) => sum + review.rating, 0) / modReviews.length;
      
      await db.execute`
        UPDATE mods
        SET average_rating = ${parseFloat(averageRating.toFixed(1))}
        WHERE id = ${mod.id}
      `;
    }
  }
  
  console.log("Reviews seeding completed successfully!");
}

seedReviews().catch(console.error);