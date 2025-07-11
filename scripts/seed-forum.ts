import { db } from "../server/db";
import { forumThreads, forumReplies } from "../shared/schema";

// Sample realistic BeamNG forum threads and replies
async function seedForumContent() {
  console.log("Seeding forum content...");

  // Announcements category (id: 1)
  const announcementThreads = [
    {
      categoryId: 1,
      userId: 1, // JSD (admin)
      title: "Welcome to JSD Mods - Official Marketplace Launch!",
      content: "Hey everyone! We're thrilled to announce the official launch of the JSD Mods marketplace. After months of development and testing, we're finally ready to share our platform with all BeamNG enthusiasts.\n\nHere you'll find high-quality, thoroughly tested mods for BeamNG.drive. Whether you're looking for vehicles, parts, maps, or configurations, we've got you covered.\n\nMake sure to check out our premium subscription for exclusive early access to new releases and subscriber-only content.\n\nWe can't wait to see what you think of the marketplace. Feel free to share any feedback or suggestions in the appropriate forum categories.\n\nHappy driving!",
      viewCount: 843,
      isPinned: true,
      isLocked: false,
    },
    {
      categoryId: 1,
      userId: 2, // Von (admin)
      title: "New Feature: Rating System Now Available",
      content: "We've just deployed a major update to the marketplace: a comprehensive rating and review system!\n\nYou can now rate any mod you've purchased on a 5-star scale and leave detailed feedback for other users and mod creators. This will help everyone find the best content and give creators valuable feedback on their work.\n\nThe review system includes:\n- 5-star rating system\n- Detailed written reviews\n- Helpful upvote system for reviews\n- Mod creator responses\n\nPlease keep all reviews constructive and respectful. Focus on the mod's quality, performance, and features rather than personal issues with creators.\n\nWe hope this new system enhances your experience on the marketplace!",
      viewCount: 412,
      isPinned: true,
      isLocked: false,
    },
    {
      categoryId: 1,
      userId: 3, // Developer (admin)
      title: "Important: Payment System Maintenance - June 15th",
      content: "We'll be performing scheduled maintenance on our payment system on June 15th from 2:00 AM to 5:00 AM UTC.\n\nDuring this time, you won't be able to make purchases or process subscription payments. Your existing mods and subscriptions will not be affected.\n\nThis maintenance is necessary to implement additional security features and improve overall payment processing speed.\n\nWe apologize for any inconvenience this might cause and appreciate your understanding as we work to improve the platform.\n\nIf you have any questions or concerns, please contact our support team.",
      viewCount: 317,
      isPinned: true,
      isLocked: true,
    }
  ];

  // Support & Help category (id: 2)
  const supportThreads = [
    {
      categoryId: 2,
      userId: 4, // Regular user
      title: "Getting 'Missing dependencies' error with Pessima racing mod",
      content: "I just purchased the Pessima Racing Edition mod but I'm getting a 'Missing dependencies' error when trying to load it in the game. I've already installed the base game Pessima, but it's still not working.\n\nI'm using BeamNG.drive version 0.26.2.0 and have tried reinstalling both the base car and the mod. Any suggestions on what might be causing this issue?\n\nError log: 'Missing dependencies: required_mod_123'",
      viewCount: 137,
      isPinned: false,
      isLocked: false,
    },
    {
      categoryId: 2,
      userId: 5, // Regular user
      title: "How to install mods manually if auto-installation fails?",
      content: "The automatic installation isn't working for me - when I click the download button in my mod locker, the file downloads but nothing happens in the game.\n\nIs there a way to manually install these mods? Where should I place the files to get them working? I'm on Windows 11 if that matters.\n\nAny help would be appreciated!",
      viewCount: 214,
      isPinned: false,
      isLocked: false,
    },
    {
      categoryId: 2,
      userId: 6, // Regular user
      title: "Subscription payment showing as pending but no access",
      content: "I subscribed to the premium plan yesterday, and the payment has gone through according to my bank statement, but my account still shows as not having an active subscription.\n\nI've tried logging out and back in, clearing my browser cache, and waiting for about 24 hours now. The payment is showing as 'pending' in my transaction history.\n\nIs there something else I need to do to activate my subscription? Order #JSD-SUB-8721",
      viewCount: 86,
      isPinned: false,
      isLocked: false,
    }
  ];

  // General Discussion category (id: 3)
  const generalThreads = [
    {
      categoryId: 3,
      userId: 7, // Regular user
      title: "What's your favorite JSD mod so far?",
      content: "Now that the marketplace has been up for a while, I'm curious to hear about everyone's favorite mods!\n\nPersonally, I'm loving the JSD Racer X - the physics are amazing and the detail on the model is incredible. The sound design alone makes it worth the purchase.\n\nWhat mods are you all enjoying the most? Any hidden gems I should check out?",
      viewCount: 453,
      isPinned: false,
      isLocked: false,
    },
    {
      categoryId: 3,
      userId: 8, // Regular user
      title: "Will we see more track mods in the future?",
      content: "Most of the mods I see on the marketplace are vehicles and parts, which is great, but I'm wondering if there are plans to release more track/map mods in the future?\n\nI'd love to see some technical tracks designed specifically for drifting or time attack. The stock maps are good, but I'm hungry for more variety.\n\nAnyone else interested in more track content? What kind of environments would you like to see?",
      viewCount: 274,
      isPinned: false,
      isLocked: false,
    },
    {
      categoryId: 3,
      userId: 9, // Regular user
      title: "Show off your modded BeamNG screenshots!",
      content: "I thought it would be fun to have a thread where we can all share screenshots of our JSD modded vehicles in BeamNG!\n\nI'll start - here's my modified Bandit with the JSD wide body kit and performance upgrades tearing up the desert track: [imagine a screenshot was linked here]\n\nThe lighting mod really makes a difference in the atmosphere, don't you think?\n\nLet's see what you've got!",
      viewCount: 892,
      isPinned: false,
      isLocked: false,
    }
  ];

  // Mod Requests category (id: 4)
  const requestThreads = [
    {
      categoryId: 4,
      userId: 10, // Regular user
      title: "Request: 90s Japanese Kei car (similar to Suzuki Cappuccino)",
      content: "I would absolutely love to see a high-quality Kei car mod similar to the Suzuki Cappuccino or Honda Beat on the marketplace.\n\nThese tiny Japanese sports cars from the 90s have such a unique character and would be perfect for technical driving on narrow roads.\n\nIdeally, it would include:\n- Accurate dimensions and weight distribution\n- Detailed engine bay with tuning options\n- Multiple body options (hardtop, soft top, etc.)\n- Period-correct interior\n\nWould anyone else be interested in something like this? I'd be willing to pay a premium for a really well-done version.",
      viewCount: 236,
      isPinned: false,
      isLocked: false,
    },
    {
      categoryId: 4,
      userId: 11, // Regular user
      title: "Request: American Muscle Car Pack",
      content: "I'd like to request a comprehensive American muscle car pack covering the golden era from the 60s and 70s.\n\nIt would be amazing to have 3-4 iconic models with historically accurate trim levels, engine options, and visual configurations. Proper sound design with those rumbling V8s would be essential!\n\nBonus points for including drag racing parts and options, as well as 'restomod' configurations with modern suspension and braking systems.\n\nIs there enough interest in classic American muscle to make this worth developing?",
      viewCount: 318,
      isPinned: false,
      isLocked: false,
    }
  ];

  // Mod Showcase category (id: 5)
  const showcaseThreads = [
    {
      categoryId: 5,
      userId: 2, // Von (admin)
      title: "[SHOWCASE] JSD Rally Monster - Coming Next Week!",
      content: "Hey mod enthusiasts!\n\nI'm thrilled to give you a sneak peek at our upcoming release: the JSD Rally Monster!\n\nThis rally-inspired creation features:\n- Custom suspension geometry with 12+ inches of travel\n- Fully simulated AWD system with adjustable torque distribution\n- Detailed damage model including deformable body panels\n- Multiple engine options from a screaming 2.0L turbo to a monster 3.5L V6\n- Rally-specific parts including light pods, mud flaps, and skid plates\n\nWe've been testing this on everything from smooth tarmac to rough mountain trails, and it handles it all beautifully.\n\nHere's a short preview video: [imagine a video was linked here]\n\nRelease is scheduled for next Wednesday. Premium subscribers will get access 3 days early!\n\nLet me know what you think!",
      viewCount: 874,
      isPinned: true,
      isLocked: false,
    },
    {
      categoryId: 5,
      userId: 1, // JSD (admin)
      title: "[SHOWCASE] JBX Classic - Vintage Sports Car",
      content: "After months of development, I'm excited to showcase our latest creation: the JBX Classic!\n\nThis vintage-inspired sports car takes cues from the elegant European roadsters of the 1960s but with a unique JSD twist. We've focused on capturing the driving experience of these classic machines while adding options for modern performance upgrades.\n\nFeatures include:\n- Hand-crafted 3D model with over 300 unique parts\n- Historically accurate suspension and drivetrain simulation\n- Multiple engine options from docile 1.6L to fire-breathing 2.2L race spec\n- Open-top and hardtop variants with functioning convertible system\n- Period-correct interior with functional gauges and switches\n\nEach body panel deforms realistically, and we've put special attention into the progressive handling characteristics that make these classics so engaging to drive.\n\nLaunching this Friday at $12.99, or included with your premium subscription!\n\nCheck out the showcase video here: [imagine a video was linked here]",
      viewCount: 739,
      isPinned: true,
      isLocked: false,
    }
  ];

  // Technical Discussions category (id: 6)
  const technicalThreads = [
    {
      categoryId: 6,
      userId: 3, // Developer (admin)
      title: "Understanding BeamNG's Jbeam physics system for modders",
      content: "I've noticed some confusion about how BeamNG's physics system works, so I thought I'd start a technical thread to help modders understand the basics of the Jbeam system.\n\nAt its core, BeamNG uses a soft-body physics model where vehicles are constructed from nodes (points in 3D space) connected by beams (connections between nodes). This allows for realistic deformation and dynamic handling characteristics.\n\nKey concepts to understand:\n\n1. **Nodes**: Think of these as the 'joints' of your vehicle. They have mass and interact with the world.\n\n2. **Beams**: These connect nodes and have properties like strength, deformation limits, and spring/damping values.\n\n3. **Weight Balance**: Node placement and mass significantly affect handling. Always check weight distribution!\n\n4. **Collision Triangles**: These define the visible collision mesh for the vehicle.\n\nWhen creating mods, it's crucial to ensure your node setup accurately represents the structure of the vehicle. Improper node placement can lead to unrealistic deformation or poor handling characteristics.\n\nFor those looking to dive deeper, I recommend studying existing Jbeam files and using the in-game node/beam visualization tools.\n\nAny other technical questions about the physics system? Post them below and I'll try to answer!",
      viewCount: 362,
      isPinned: true,
      isLocked: false,
    },
    {
      categoryId: 6,
      userId: 12, // Regular user
      title: "Optimization techniques for high-poly vehicle models",
      content: "I've been working on a highly detailed vehicle mod (approximately 2.4 million polygons in its raw form), and I'm struggling with optimization while maintaining visual quality.\n\nI've tried decimation in Blender, but I'm losing too much detail in critical areas like the engine bay and interior. What techniques are you all using to optimize high-poly models while preserving the important details?\n\nSome specific questions:\n\n1. What polygon count do you target for exterior body panels vs. mechanical components?\n\n2. Are there parts that can be lower poly without noticeable quality loss?\n\n3. Any specific LOD (Level of Detail) strategies that work well in BeamNG?\n\n4. How do you handle high-res textures - are you using normal maps to fake detail on lower-poly models?\n\nAny advice from experienced modders would be greatly appreciated!",
      viewCount: 204,
      isPinned: false,
      isLocked: false,
    }
  ];

  // Combine all threads
  const allThreads = [
    ...announcementThreads,
    ...supportThreads,
    ...generalThreads,
    ...requestThreads,
    ...showcaseThreads,
    ...technicalThreads
  ];

  // Add created/updated dates and metadata
  const threadsWithDates = allThreads.map(thread => {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60)); // Random date within past 60 days
    
    return {
      ...thread,
      createdAt: createdDate,
      updatedAt: createdDate,
      replyCount: 0 // Will be updated after replies are added
    };
  });

  // Insert threads
  const insertedThreads = await db.insert(forumThreads).values(threadsWithDates).returning();
  console.log(`Inserted ${insertedThreads.length} forum threads`);

  // Create replies for each thread
  const allReplies = [];

  // Announcement replies
  const announcementReplies = [
    // Welcome thread replies
    [
      {
        threadId: insertedThreads[0].id,
        userId: 4,
        content: "This is fantastic news! I've been following JSD's work on YouTube for ages and can't wait to try out these mods. The quality of your work has always been impressive. Are there any plans to release that drift Pessima you showcased last month?"
      },
      {
        threadId: insertedThreads[0].id,
        userId: 5,
        content: "Congrats on the launch! The site looks amazing. I've already picked up the offroad package and it's working flawlessly. The physics tuning is spot on - feels much more realistic than other mods I've tried."
      },
      {
        threadId: insertedThreads[0].id,
        userId: 1, // JSD (admin)
        content: "Thanks for the kind words everyone! We're really excited about the launch. To answer your question about the drift Pessima - yes, it's coming very soon. We're just finalizing some suspension tuning to make sure the handling is perfect before release. Keep an eye on the Showcase section!"
      },
      {
        threadId: insertedThreads[0].id,
        userId: 6,
        content: "Just subscribed to premium and downloaded the exclusive Rally X mod. Absolutely blown away by the detail and handling! Worth every penny. The customization options are insane too - spent hours just tweaking setups."
      }
    ],
    
    // Rating system thread replies
    [
      {
        threadId: insertedThreads[1].id,
        userId: 7,
        content: "This is a much-needed feature! Will definitely help separate the quality mods from the mediocre ones. Is there a way to sort by highest rated on the browse page?"
      },
      {
        threadId: insertedThreads[1].id,
        userId: 2, // Von (admin)
        content: "Yes, we've added sorting by rating on the browse page! You can find it in the dropdown menu at the top of the listings. We're also planning to add a 'Top Rated' section to the homepage in the next update."
      },
      {
        threadId: insertedThreads[1].id,
        userId: 8,
        content: "Left my first review on the Sunburst Drift mod. The system is really straightforward to use. One suggestion though - maybe add the ability to include screenshots in reviews? Would be helpful to show specific features or issues."
      }
    ],
    
    // Maintenance thread replies
    [
      {
        threadId: insertedThreads[2].id,
        userId: 9,
        content: "Thanks for the heads up. Will this affect users in different time zones or is it strictly during the times mentioned?"
      },
      {
        threadId: insertedThreads[2].id,
        userId: 3, // Developer (admin)
        content: "The maintenance will only happen during the specified UTC time frame. We chose this timing as it's typically when we have the lowest user activity globally. All services should be back to normal after 5:00 AM UTC."
      }
    ]
  ];

  // Support thread replies
  const supportReplies = [
    // Missing dependencies thread
    [
      {
        threadId: insertedThreads[3].id,
        userId: 3, // Developer (admin)
        content: "This error usually means you need the latest Racing Parts Pack to use the Pessima Racing Edition. It's a separate download in your mod locker that contains shared assets used by several racing mods. Once you install both, it should work fine!"
      },
      {
        threadId: insertedThreads[3].id,
        userId: 4, // Thread starter
        content: "That worked perfectly! I didn't realize there was a core racing pack needed. Maybe this could be made clearer on the mod page? Anyway, thanks for the quick help!"
      },
      {
        threadId: insertedThreads[3].id,
        userId: 3, // Developer (admin)
        content: "Glad it worked! You're right about making the dependencies clearer - we'll update the product pages to show required core packs more prominently. Thanks for the feedback!"
      }
    ],
    
    // Manual installation thread
    [
      {
        threadId: insertedThreads[4].id,
        userId: 10,
        content: "For manual installation, you need to extract the .zip files to your BeamNG mods folder. On Windows, it's usually at: C:\\Users\\YourUsername\\AppData\\Local\\BeamNG.drive\\0.26\\mods\n\nMake sure each mod has its own subfolder with the proper structure. The game should detect them next time you launch it."
      },
      {
        threadId: insertedThreads[4].id,
        userId: 5, // Thread starter
        content: "Found it! Thanks for the help. For anyone else having this issue, you might need to create the mods folder if it doesn't exist yet. Everything's working perfectly now."
      }
    ],
    
    // Subscription payment thread
    [
      {
        threadId: insertedThreads[5].id,
        userId: 2, // Von (admin)
        content: "Sorry to hear you're having trouble with your subscription! I've checked your order number and the payment is indeed showing as pending in our system. This sometimes happens due to bank processing delays. I've manually activated your premium subscription now, so you should have full access. Please log out and back in to see the changes. Let me know if you have any further issues!"
      },
      {
        threadId: insertedThreads[5].id,
        userId: 6, // Thread starter
        content: "That fixed it! I can now access all the premium content. Thanks for the quick response and resolution!"
      }
    ]
  ];

  // General discussion replies
  const generalReplies = [
    // Favorite mod thread
    [
      {
        threadId: insertedThreads[6].id,
        userId: 11,
        content: "I'm absolutely loving the Offroad Monster truck! The suspension articulation is incredible - you can crawl over almost anything. Plus, the detailed undercarriage with all the driveshafts and differentials visible is a nice touch. Worth every penny."
      },
      {
        threadId: insertedThreads[6].id,
        userId: 12,
        content: "For me it's got to be the Compact Rally. It's not as flashy as some of the other mods, but the handling model is just perfect. Feels exactly like throwing around a 90s rally car, especially on gravel. The different setup options for tarmac vs dirt are super well implemented too."
      },
      {
        threadId: insertedThreads[6].id,
        userId: 7, // Thread starter
        content: "The Compact Rally is definitely on my wishlist! I've seen some great videos of it in action. Has anyone tried the Hotrod V8? I'm curious if the engine sound is as good as it looks in the preview."
      },
      {
        threadId: insertedThreads[6].id,
        userId: 5,
        content: "I've got the Hotrod V8 and can confirm the sound design is exceptional. They must have recorded a real engine because the idle rumble and high RPM roar are spot on. It's also got different exhaust options that actually change the sound profile. My only complaint is that it's a bit too tail-happy on keyboard controls, but with a wheel it's manageable."
      }
    ],
    
    // Track mods thread
    [
      {
        threadId: insertedThreads[7].id,
        userId: 1, // JSD (admin)
        content: "We're definitely planning to expand into more track content! We have a mountain touge course in development right now that should be ready in about a month. It's inspired by Japanese mountain passes with tight hairpins and technical sections.\n\nWe're also working on a large airport/industrial area that can be configured for drift events, time attack, or drag racing. If there are specific types of environments you'd like to see, please let us know!"
      },
      {
        threadId: insertedThreads[7].id,
        userId: 8, // Thread starter
        content: "That sounds amazing! I'd love to see a dedicated rallycross track with mixed surfaces. Something with jumps, water splashes, and alternating tarmac/dirt sections would be perfect for testing the rally cars."
      },
      {
        threadId: insertedThreads[7].id,
        userId: 9,
        content: "I'd pay good money for a proper recreation of some iconic real-world tracks. Something like Pikes Peak or Goodwood would be incredible for testing hillclimb builds."
      }
    ],
    
    // Screenshots thread
    [
      {
        threadId: insertedThreads[8].id,
        userId: 6,
        content: "Here's my JSD Velocity X on the coastal highway! [imagine a screenshot was linked here] The aerodynamic parts kit totally transforms the look. I'm running the Stage 3 performance package and it absolutely flies."
      },
      {
        threadId: insertedThreads[8].id,
        userId: 10,
        content: "Check out this action shot of the Trophy Truck mid-jump! [imagine a screenshot was linked here] The suspension travel is incredible, landed this perfectly from about 30 feet up and kept going. The desert map is perfect for this beast."
      },
      {
        threadId: insertedThreads[8].id,
        userId: 9, // Thread starter
        content: "Those are awesome shots! The Trophy Truck looks insane in mid-air. Here's another one of my Bandit at sunset with the new light bar mod: [imagine a screenshot was linked here] The volumetric dust effects really add to the atmosphere."
      }
    ]
  ];

  // Mod requests replies
  const requestReplies = [
    // Kei car thread
    [
      {
        threadId: insertedThreads[9].id,
        userId: 5,
        content: "I would absolutely buy this! Kei cars are so underrepresented in racing games despite being super fun to drive. The tiny wheelbase and limited power makes them really rewarding when you get the most out of them."
      },
      {
        threadId: insertedThreads[9].id,
        userId: 2, // Von (admin)
        content: "Thanks for the suggestion! We've actually been considering a 90s Japanese Kei sports car for our next project. It's great to see there's interest in this. Would you prefer a more stock-focused accurate reproduction, or something with lots of modification options for engine swaps and wider body kits?"
      },
      {
        threadId: insertedThreads[9].id,
        userId: 10, // Thread starter
        content: "Personally, I'd love to see both! Start with an historically accurate base model that captures the essence of these quirky cars, but then also include some wild modification options. Part of the appeal of Kei cars is how people modify them far beyond their original specs while keeping the compact dimensions."
      },
      {
        threadId: insertedThreads[9].id,
        userId: 11,
        content: "Another vote for this! I'd especially love to see some of the quirky features these cars had - like the Cappuccino's removable roof panels that could be stored in the trunk. The engineering that went into these tiny powerhouses is fascinating."
      }
    ],
    
    // Muscle car thread
    [
      {
        threadId: insertedThreads[10].id,
        userId: 8,
        content: "I've been wanting a proper muscle car pack for ages! Especially interested in seeing some Mopar representation - a good Challenger or Charger equivalent would be amazing. With authentic V8 sounds and visual customization options, this would be an instant buy."
      },
      {
        threadId: insertedThreads[10].id,
        userId: 1, // JSD (admin)
        content: "We're definitely interested in creating some American muscle! It's a bit challenging to get the suspension dynamics right since these cars handle so differently from modern vehicles, but we're up for the challenge. I've added this to our development roadmap to explore after our current projects are complete. Thanks for the suggestion!"
      }
    ]
  ];

  // Showcase replies
  const showcaseReplies = [
    // Rally Monster thread
    [
      {
        threadId: insertedThreads[11].id,
        userId: 5,
        content: "This looks incredible! The suspension travel in that preview video is insane. Will there be different livery options available? And please tell me we can adjust the anti-lag system for those sweet backfires!"
      },
      {
        threadId: insertedThreads[11].id,
        userId: 2, // Von (admin)
        content: "Thanks for the excitement! Yes, we'll have 8 different livery options at launch, plus a customizable one where you can change the base colors. And the anti-lag is fully configurable - you can adjust timing, intensity, and even disable it completely if you prefer a cleaner sound. The backfire effects have dynamic lighting too!"
      },
      {
        threadId: insertedThreads[11].id,
        userId: 10,
        content: "Day one purchase for me! Will premium subscribers get any exclusive liveries or parts with this one? The suspension looks perfect for the rally scenarios I like to set up."
      },
      {
        threadId: insertedThreads[11].id,
        userId: 2, // Von (admin)
        content: "Premium subscribers will get an exclusive 'Championship Edition' livery with custom mudflaps and light pod configuration. They'll also receive a tuning preset file that we developed with the help of an actual rally driver for the perfect gravel setup. Hope you enjoy it!"
      }
    ],
    
    // JBX Classic thread
    [
      {
        threadId: insertedThreads[12].id,
        userId: 12,
        content: "Absolutely beautiful model! The attention to detail on the interior is outstanding. I'm a sucker for classic sports cars with their analog driving feel. Will we be able to toggle between original-spec performance and enhanced modern options?"
      },
      {
        threadId: insertedThreads[12].id,
        userId: 1, // JSD (admin)
        content: "Thank you for the kind words! Yes, we've implemented a unique system for this car where you can toggle between 'Classic' and 'Restomod' configurations. Classic gives you the authentic 60s driving experience with period-correct limitations, while Restomod maintains the vintage look but with modern suspension geometry, braking performance, and optional engine enhancements. You can even mix and match - like keeping the vintage engine but upgrading the suspension."
      },
      {
        threadId: insertedThreads[12].id,
        userId: 6,
        content: "The sound in that showcase video is amazing! Did you record an actual vintage engine for this? The exhaust note has that perfect raspy tone that modern cars just don't have."
      },
      {
        threadId: insertedThreads[12].id,
        userId: 1, // JSD (admin)
        content: "Good ear! We actually recorded a restored 1967 sports car with a similar engine configuration. We captured dozens of audio samples at different RPMs and load conditions to get that authentic sound. The in-game engine note dynamically changes based on load, RPM, and even exhaust configuration if you modify it."
      }
    ]
  ];

  // Technical discussion replies
  const technicalReplies = [
    // Jbeam physics thread
    [
      {
        threadId: insertedThreads[13].id,
        userId: 12,
        content: "This is incredibly helpful, thanks! I've been struggling with getting the suspension geometry right on my mod. One question - what's the best approach for modeling anti-roll bars in the Jbeam system? I've tried a few methods but can't get the right balance between roll stiffness and articulation."
      },
      {
        threadId: insertedThreads[13].id,
        userId: 3, // Developer (admin)
        content: "Great question about anti-roll bars! The most effective method I've found is to use dedicated anti-roll bar beams with specific spring and damping values, rather than just stiffening the existing suspension beams. This allows for more natural articulation while still controlling body roll.\n\nYou'll want to create beams that connect the left and right suspension components (usually at the control arms) with carefully tuned beam properties. The key parameters to focus on are:\n\n- `springExpansion` and `springCompression`: These control the stiffness of the anti-roll effect\n- `dampExpansion` and `dampCompression`: Keep these relatively low to avoid affecting rapid suspension movements\n\nThe BeamNG Pickup is a good reference model to study - check out its anti-roll bar implementation in the Jbeam files."
      },
      {
        threadId: insertedThreads[13].id,
        userId: 10,
        content: "I'm having trouble with wheels clipping through fenders during extreme compression. Is there a recommended way to set up collision properly between suspension components and body panels?"
      },
      {
        threadId: insertedThreads[13].id,
        userId: 3, // Developer (admin)
        content: "For wheel-to-fender collision, you need to ensure you have proper collision triangles defined on both the wheel well and the wheel itself. A common mistake is forgetting to add collision triangles to the inner fender surfaces.\n\nYou can also add 'stopped' beam properties to create hard stops for suspension travel before visual clipping occurs. Look for the `beamPrecompression` and `beamDeform` parameters - these can be tuned to create progressive stiffening as the suspension approaches maximum compression.\n\nIf you're still having issues, check that your wheel collision mesh isn't too simplified. Sometimes adding a few more collision triangles to represent the tire sidewall can solve persistent clipping problems."
      }
    ],
    
    // Optimization thread
    [
      {
        threadId: insertedThreads[14].id,
        userId: 9,
        content: "I've had good results using a multi-tier LOD system with these general polygon targets:\n\n- Exterior (visible from distance): ~100k polys\n- Engine bay components: ~150k polys combined\n- Interior: ~120k polys\n- Undercarriage: ~80k polys\n\nThe key is being strategic about where you maintain detail. For example, cluster more polygons around complex curves and panel gaps, while simplified flat surfaces. Normal maps are essential for maintaining the appearance of small details like panel stamping and fabric textures."
      },
      {
        threadId: insertedThreads[14].id,
        userId: 3, // Developer (admin)
        content: "Great question about optimization! Here's my approach:\n\n1. For mechanical parts like engine components, you can often reduce interior/hidden geometry substantially. Players rarely see the inside of an engine block or transmission case.\n\n2. Use normal maps aggressively for surface details like vents, grilles, and interior textures.\n\n3. For LOD strategy, I recommend 3 levels with approximately 60% and 30% of original poly count. LOD distance in BeamNG is quite generous.\n\n4. Texture resolution matters more than you might think - a well-textured lower-poly model often looks better than a high-poly model with basic textures. 2K textures for exteriors and 1K for smaller parts is usually sufficient.\n\n5. Look for redundant edge loops and n-gons in your model - these are often easy targets for optimization.\n\nHappy to review your model if you want to share some screenshots of the wireframe!"
      },
      {
        threadId: insertedThreads[14].id,
        userId: 12, // Thread starter
        content: "Thank you both for the detailed advice! I've started implementing a more aggressive LOD system and focusing my high-poly detail on the parts that are most visible during gameplay. The normal map suggestion was particularly helpful - I've managed to move a lot of small details like bolts and panel seams to normal maps instead of geometry.\n\nOne follow-up question: for transparent parts like headlights and glass, are there any special considerations for optimization? They seem particularly demanding on performance."
      },
      {
        threadId: insertedThreads[14].id,
        userId: 3, // Developer (admin)
        content: "Excellent question about transparent parts! They do require special handling:\n\n1. Transparent materials are indeed more performance-heavy due to the rendering order requirements. Keep polygon count especially low for these parts.\n\n2. For headlights, model only the visible outer lens and reflector in detail. The interior bulb and housing can be much lower poly or even just textured.\n\n3. For glass, avoid double-sided materials when possible. It's better to model thin glass with single-sided faces than use double-sided materials.\n\n4. Limit overlapping transparent layers - each layer of transparency adds rendering cost.\n\n5. For complex headlight assemblies, consider using masked/cutout transparency instead of true transparency for internal details.\n\nImplementing these techniques can significantly improve performance without noticeable visual quality loss."
      }
    ]
  ];

  // Combine all replies
  const allThreadReplies = [
    ...announcementReplies.flat(),
    ...supportReplies.flat(),
    ...generalReplies.flat(),
    ...requestReplies.flat(),
    ...showcaseReplies.flat(),
    ...technicalReplies.flat()
  ];

  // Add created/updated dates
  const repliesWithDates = allThreadReplies.map(reply => {
    const threadIndex = insertedThreads.findIndex(t => t.id === reply.threadId);
    const threadCreatedDate = new Date(insertedThreads[threadIndex].createdAt);
    
    // Create a date between thread creation and now
    const createdDate = new Date(threadCreatedDate);
    createdDate.setHours(createdDate.getHours() + Math.floor(Math.random() * 72)); // Random time within 3 days of thread
    
    return {
      ...reply,
      createdAt: createdDate,
      updatedAt: createdDate
    };
  });

  // Insert replies
  const insertedReplies = await db.insert(forumReplies).values(repliesWithDates).returning();
  console.log(`Inserted ${insertedReplies.length} forum replies`);

  // Update thread reply counts
  for (const thread of insertedThreads) {
    const replyCount = repliesWithDates.filter(reply => reply.threadId === thread.id).length;
    
    // Update the thread with the reply count and last reply date
    const threadReplies = repliesWithDates.filter(reply => reply.threadId === thread.id);
    const lastReply = threadReplies.length > 0 
      ? threadReplies.reduce((latest, reply) => 
          new Date(reply.createdAt) > new Date(latest.createdAt) ? reply : latest, threadReplies[0])
      : null;
    
    // Use a direct SQL query to update the thread
    await db.query(
      `UPDATE forum_threads SET reply_count = $1, updated_at = $2 WHERE id = $3`,
      [
        replyCount,
        lastReply ? new Date(lastReply.createdAt) : new Date(thread.createdAt),
        thread.id
      ]
    );
  }

  console.log("Forum seeding completed!");
}

seedForumContent().catch(console.error);