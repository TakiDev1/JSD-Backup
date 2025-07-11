-- Insert forum threads
INSERT INTO forum_threads (category_id, user_id, title, content, view_count, is_pinned, is_locked, created_at, updated_at, reply_count)
VALUES
-- Announcements category (id: 1)
(1, 1, 'Welcome to JSD Mods - Official Marketplace Launch!', 
'Hey everyone! We''re thrilled to announce the official launch of the JSD Mods marketplace. After months of development and testing, we''re finally ready to share our platform with all BeamNG enthusiasts.

Here you''ll find high-quality, thoroughly tested mods for BeamNG.drive. Whether you''re looking for vehicles, parts, maps, or configurations, we''ve got you covered.

Make sure to check out our premium subscription for exclusive early access to new releases and subscriber-only content.

We can''t wait to see what you think of the marketplace. Feel free to share any feedback or suggestions in the appropriate forum categories.

Happy driving!', 843, true, false, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days', 4),

(1, 2, 'New Feature: Rating System Now Available', 
'We''ve just deployed a major update to the marketplace: a comprehensive rating and review system!

You can now rate any mod you''ve purchased on a 5-star scale and leave detailed feedback for other users and mod creators. This will help everyone find the best content and give creators valuable feedback on their work.

The review system includes:
- 5-star rating system
- Detailed written reviews
- Helpful upvote system for reviews
- Mod creator responses

Please keep all reviews constructive and respectful. Focus on the mod''s quality, performance, and features rather than personal issues with creators.

We hope this new system enhances your experience on the marketplace!', 412, true, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', 3),

(1, 3, 'Important: Payment System Maintenance - June 15th', 
'We''ll be performing scheduled maintenance on our payment system on June 15th from 2:00 AM to 5:00 AM UTC.

During this time, you won''t be able to make purchases or process subscription payments. Your existing mods and subscriptions will not be affected.

This maintenance is necessary to implement additional security features and improve overall payment processing speed.

We apologize for any inconvenience this might cause and appreciate your understanding as we work to improve the platform.

If you have any questions or concerns, please contact our support team.', 317, true, true, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 2),

-- Support & Help category (id: 2)
(2, 4, 'Getting ''Missing dependencies'' error with Pessima racing mod', 
'I just purchased the Pessima Racing Edition mod but I''m getting a ''Missing dependencies'' error when trying to load it in the game. I''ve already installed the base game Pessima, but it''s still not working.

I''m using BeamNG.drive version 0.26.2.0 and have tried reinstalling both the base car and the mod. Any suggestions on what might be causing this issue?

Error log: ''Missing dependencies: required_mod_123''', 137, false, false, NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', 3),

(2, 5, 'How to install mods manually if auto-installation fails?', 
'The automatic installation isn''t working for me - when I click the download button in my mod locker, the file downloads but nothing happens in the game.

Is there a way to manually install these mods? Where should I place the files to get them working? I''m on Windows 11 if that matters.

Any help would be appreciated!', 214, false, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', 2),

(2, 6, 'Subscription payment showing as pending but no access', 
'I subscribed to the premium plan yesterday, and the payment has gone through according to my bank statement, but my account still shows as not having an active subscription.

I''ve tried logging out and back in, clearing my browser cache, and waiting for about 24 hours now. The payment is showing as ''pending'' in my transaction history.

Is there something else I need to do to activate my subscription? Order #JSD-SUB-8721', 86, false, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 2),

-- General Discussion category (id: 3)
(3, 7, 'What''s your favorite JSD mod so far?', 
'Now that the marketplace has been up for a while, I''m curious to hear about everyone''s favorite mods!

Personally, I''m loving the JSD Racer X - the physics are amazing and the detail on the model is incredible. The sound design alone makes it worth the purchase.

What mods are you all enjoying the most? Any hidden gems I should check out?', 453, false, false, NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days', 4),

(3, 8, 'Will we see more track mods in the future?', 
'Most of the mods I see on the marketplace are vehicles and parts, which is great, but I''m wondering if there are plans to release more track/map mods in the future?

I''d love to see some technical tracks designed specifically for drifting or time attack. The stock maps are good, but I''m hungry for more variety.

Anyone else interested in more track content? What kind of environments would you like to see?', 274, false, false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', 3),

(3, 9, 'Show off your modded BeamNG screenshots!', 
'I thought it would be fun to have a thread where we can all share screenshots of our JSD modded vehicles in BeamNG!

I''ll start - here''s my modified Bandit with the JSD wide body kit and performance upgrades tearing up the desert track: [imagine a screenshot was linked here]

The lighting mod really makes a difference in the atmosphere, don''t you think?

Let''s see what you''ve got!', 892, false, false, NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days', 3),

-- Mod Requests category (id: 4)
(4, 10, 'Request: 90s Japanese Kei car (similar to Suzuki Cappuccino)', 
'I would absolutely love to see a high-quality Kei car mod similar to the Suzuki Cappuccino or Honda Beat on the marketplace.

These tiny Japanese sports cars from the 90s have such a unique character and would be perfect for technical driving on narrow roads.

Ideally, it would include:
- Accurate dimensions and weight distribution
- Detailed engine bay with tuning options
- Multiple body options (hardtop, soft top, etc.)
- Period-correct interior

Would anyone else be interested in something like this? I''d be willing to pay a premium for a really well-done version.', 236, false, false, NOW() - INTERVAL '22 days', NOW() - INTERVAL '15 days', 4),

(4, 11, 'Request: American Muscle Car Pack', 
'I''d like to request a comprehensive American muscle car pack covering the golden era from the 60s and 70s.

It would be amazing to have 3-4 iconic models with historically accurate trim levels, engine options, and visual configurations. Proper sound design with those rumbling V8s would be essential!

Bonus points for including drag racing parts and options, as well as ''restomod'' configurations with modern suspension and braking systems.

Is there enough interest in classic American muscle to make this worth developing?', 318, false, false, NOW() - INTERVAL '16 days', NOW() - INTERVAL '14 days', 2),

-- Mod Showcase category (id: 5)
(5, 2, '[SHOWCASE] JSD Rally Monster - Coming Next Week!', 
'Hey mod enthusiasts!

I''m thrilled to give you a sneak peek at our upcoming release: the JSD Rally Monster!

This rally-inspired creation features:
- Custom suspension geometry with 12+ inches of travel
- Fully simulated AWD system with adjustable torque distribution
- Detailed damage model including deformable body panels
- Multiple engine options from a screaming 2.0L turbo to a monster 3.5L V6
- Rally-specific parts including light pods, mud flaps, and skid plates

We''ve been testing this on everything from smooth tarmac to rough mountain trails, and it handles it all beautifully.

Here''s a short preview video: [imagine a video was linked here]

Release is scheduled for next Wednesday. Premium subscribers will get access 3 days early!

Let me know what you think!', 874, true, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', 4),

(5, 1, '[SHOWCASE] JBX Classic - Vintage Sports Car', 
'After months of development, I''m excited to showcase our latest creation: the JBX Classic!

This vintage-inspired sports car takes cues from the elegant European roadsters of the 1960s but with a unique JSD twist. We''ve focused on capturing the driving experience of these classic machines while adding options for modern performance upgrades.

Features include:
- Hand-crafted 3D model with over 300 unique parts
- Historically accurate suspension and drivetrain simulation
- Multiple engine options from docile 1.6L to fire-breathing 2.2L race spec
- Open-top and hardtop variants with functioning convertible system
- Period-correct interior with functional gauges and switches

Each body panel deforms realistically, and we''ve put special attention into the progressive handling characteristics that make these classics so engaging to drive.

Launching this Friday at $12.99, or included with your premium subscription!

Check out the showcase video here: [imagine a video was linked here]', 739, true, false, NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days', 4),

-- Technical Discussions category (id: 6)
(6, 3, 'Understanding BeamNG''s Jbeam physics system for modders', 
'I''ve noticed some confusion about how BeamNG''s physics system works, so I thought I''d start a technical thread to help modders understand the basics of the Jbeam system.

At its core, BeamNG uses a soft-body physics model where vehicles are constructed from nodes (points in 3D space) connected by beams (connections between nodes). This allows for realistic deformation and dynamic handling characteristics.

Key concepts to understand:

1. **Nodes**: Think of these as the ''joints'' of your vehicle. They have mass and interact with the world.

2. **Beams**: These connect nodes and have properties like strength, deformation limits, and spring/damping values.

3. **Weight Balance**: Node placement and mass significantly affect handling. Always check weight distribution!

4. **Collision Triangles**: These define the visible collision mesh for the vehicle.

When creating mods, it''s crucial to ensure your node setup accurately represents the structure of the vehicle. Improper node placement can lead to unrealistic deformation or poor handling characteristics.

For those looking to dive deeper, I recommend studying existing Jbeam files and using the in-game node/beam visualization tools.

Any other technical questions about the physics system? Post them below and I''ll try to answer!', 362, true, false, NOW() - INTERVAL '45 days', NOW() - INTERVAL '35 days', 4),

(6, 12, 'Optimization techniques for high-poly vehicle models', 
'I''ve been working on a highly detailed vehicle mod (approximately 2.4 million polygons in its raw form), and I''m struggling with optimization while maintaining visual quality.

I''ve tried decimation in Blender, but I''m losing too much detail in critical areas like the engine bay and interior. What techniques are you all using to optimize high-poly models while preserving the important details?

Some specific questions:

1. What polygon count do you target for exterior body panels vs. mechanical components?

2. Are there parts that can be lower poly without noticeable quality loss?

3. Any specific LOD (Level of Detail) strategies that work well in BeamNG?

4. How do you handle high-res textures - are you using normal maps to fake detail on lower-poly models?

Any advice from experienced modders would be greatly appreciated!', 204, false, false, NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days', 4);

-- Insert forum replies
INSERT INTO forum_replies (thread_id, user_id, content, created_at, updated_at)
VALUES
-- Welcome thread replies
((SELECT id FROM forum_threads WHERE title = 'Welcome to JSD Mods - Official Marketplace Launch!' LIMIT 1), 
4, 
'This is fantastic news! I''ve been following JSD''s work on YouTube for ages and can''t wait to try out these mods. The quality of your work has always been impressive. Are there any plans to release that drift Pessima you showcased last month?', 
NOW() - INTERVAL '29 days', 
NOW() - INTERVAL '29 days'),

((SELECT id FROM forum_threads WHERE title = 'Welcome to JSD Mods - Official Marketplace Launch!' LIMIT 1), 
5, 
'Congrats on the launch! The site looks amazing. I''ve already picked up the offroad package and it''s working flawlessly. The physics tuning is spot on - feels much more realistic than other mods I''ve tried.', 
NOW() - INTERVAL '28 days', 
NOW() - INTERVAL '28 days'),

((SELECT id FROM forum_threads WHERE title = 'Welcome to JSD Mods - Official Marketplace Launch!' LIMIT 1), 
1, 
'Thanks for the kind words everyone! We''re really excited about the launch. To answer your question about the drift Pessima - yes, it''s coming very soon. We''re just finalizing some suspension tuning to make sure the handling is perfect before release. Keep an eye on the Showcase section!', 
NOW() - INTERVAL '27 days', 
NOW() - INTERVAL '27 days'),

((SELECT id FROM forum_threads WHERE title = 'Welcome to JSD Mods - Official Marketplace Launch!' LIMIT 1), 
6, 
'Just subscribed to premium and downloaded the exclusive Rally X mod. Absolutely blown away by the detail and handling! Worth every penny. The customization options are insane too - spent hours just tweaking setups.', 
NOW() - INTERVAL '25 days', 
NOW() - INTERVAL '25 days'),

-- Rating system thread replies
((SELECT id FROM forum_threads WHERE title = 'New Feature: Rating System Now Available' LIMIT 1), 
7, 
'This is a much-needed feature! Will definitely help separate the quality mods from the mediocre ones. Is there a way to sort by highest rated on the browse page?', 
NOW() - INTERVAL '14 days', 
NOW() - INTERVAL '14 days'),

((SELECT id FROM forum_threads WHERE title = 'New Feature: Rating System Now Available' LIMIT 1), 
2, 
'Yes, we''ve added sorting by rating on the browse page! You can find it in the dropdown menu at the top of the listings. We''re also planning to add a ''Top Rated'' section to the homepage in the next update.', 
NOW() - INTERVAL '13 days', 
NOW() - INTERVAL '13 days'),

((SELECT id FROM forum_threads WHERE title = 'New Feature: Rating System Now Available' LIMIT 1), 
8, 
'Left my first review on the Sunburst Drift mod. The system is really straightforward to use. One suggestion though - maybe add the ability to include screenshots in reviews? Would be helpful to show specific features or issues.', 
NOW() - INTERVAL '10 days', 
NOW() - INTERVAL '10 days'),

-- Maintenance thread replies
((SELECT id FROM forum_threads WHERE title = 'Important: Payment System Maintenance - June 15th' LIMIT 1), 
9, 
'Thanks for the heads up. Will this affect users in different time zones or is it strictly during the times mentioned?', 
NOW() - INTERVAL '7 days', 
NOW() - INTERVAL '7 days'),

((SELECT id FROM forum_threads WHERE title = 'Important: Payment System Maintenance - June 15th' LIMIT 1), 
3, 
'The maintenance will only happen during the specified UTC time frame. We chose this timing as it''s typically when we have the lowest user activity globally. All services should be back to normal after 5:00 AM UTC.', 
NOW() - INTERVAL '7 days', 
NOW() - INTERVAL '7 days'),

-- Missing dependencies thread
((SELECT id FROM forum_threads WHERE title LIKE 'Getting ''Missing dependencies''%' LIMIT 1), 
3, 
'This error usually means you need the latest Racing Parts Pack to use the Pessima Racing Edition. It''s a separate download in your mod locker that contains shared assets used by several racing mods. Once you install both, it should work fine!', 
NOW() - INTERVAL '14 days', 
NOW() - INTERVAL '14 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Getting ''Missing dependencies''%' LIMIT 1), 
4, 
'That worked perfectly! I didn''t realize there was a core racing pack needed. Maybe this could be made clearer on the mod page? Anyway, thanks for the quick help!', 
NOW() - INTERVAL '13 days', 
NOW() - INTERVAL '13 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Getting ''Missing dependencies''%' LIMIT 1), 
3, 
'Glad it worked! You''re right about making the dependencies clearer - we''ll update the product pages to show required core packs more prominently. Thanks for the feedback!', 
NOW() - INTERVAL '13 days', 
NOW() - INTERVAL '13 days'),

-- Manual installation thread
((SELECT id FROM forum_threads WHERE title LIKE 'How to install mods manually%' LIMIT 1), 
10, 
'For manual installation, you need to extract the .zip files to your BeamNG mods folder. On Windows, it''s usually at: C:\\Users\\YourUsername\\AppData\\Local\\BeamNG.drive\\0.26\\mods\n\nMake sure each mod has its own subfolder with the proper structure. The game should detect them next time you launch it.', 
NOW() - INTERVAL '10 days', 
NOW() - INTERVAL '10 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'How to install mods manually%' LIMIT 1), 
5, 
'Found it! Thanks for the help. For anyone else having this issue, you might need to create the mods folder if it doesn''t exist yet. Everything''s working perfectly now.', 
NOW() - INTERVAL '9 days', 
NOW() - INTERVAL '9 days'),

-- Subscription payment thread
((SELECT id FROM forum_threads WHERE title LIKE 'Subscription payment showing%' LIMIT 1), 
2, 
'Sorry to hear you''re having trouble with your subscription! I''ve checked your order number and the payment is indeed showing as pending in our system. This sometimes happens due to bank processing delays. I''ve manually activated your premium subscription now, so you should have full access. Please log out and back in to see the changes. Let me know if you have any further issues!', 
NOW() - INTERVAL '3 days', 
NOW() - INTERVAL '3 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Subscription payment showing%' LIMIT 1), 
6, 
'That fixed it! I can now access all the premium content. Thanks for the quick response and resolution!', 
NOW() - INTERVAL '2 days', 
NOW() - INTERVAL '2 days'),

-- Favorite mod thread
((SELECT id FROM forum_threads WHERE title = 'What''s your favorite JSD mod so far?' LIMIT 1), 
11, 
'I''m absolutely loving the Offroad Monster truck! The suspension articulation is incredible - you can crawl over almost anything. Plus, the detailed undercarriage with all the driveshafts and differentials visible is a nice touch. Worth every penny.', 
NOW() - INTERVAL '24 days', 
NOW() - INTERVAL '24 days'),

((SELECT id FROM forum_threads WHERE title = 'What''s your favorite JSD mod so far?' LIMIT 1), 
12, 
'For me it''s got to be the Compact Rally. It''s not as flashy as some of the other mods, but the handling model is just perfect. Feels exactly like throwing around a 90s rally car, especially on gravel. The different setup options for tarmac vs dirt are super well implemented too.', 
NOW() - INTERVAL '23 days', 
NOW() - INTERVAL '23 days'),

((SELECT id FROM forum_threads WHERE title = 'What''s your favorite JSD mod so far?' LIMIT 1), 
7, 
'The Compact Rally is definitely on my wishlist! I''ve seen some great videos of it in action. Has anyone tried the Hotrod V8? I''m curious if the engine sound is as good as it looks in the preview.', 
NOW() - INTERVAL '22 days', 
NOW() - INTERVAL '22 days'),

((SELECT id FROM forum_threads WHERE title = 'What''s your favorite JSD mod so far?' LIMIT 1), 
5, 
'I''ve got the Hotrod V8 and can confirm the sound design is exceptional. They must have recorded a real engine because the idle rumble and high RPM roar are spot on. It''s also got different exhaust options that actually change the sound profile. My only complaint is that it''s a bit too tail-happy on keyboard controls, but with a wheel it''s manageable.', 
NOW() - INTERVAL '20 days', 
NOW() - INTERVAL '20 days'),

-- Track mods thread
((SELECT id FROM forum_threads WHERE title LIKE 'Will we see more track mods%' LIMIT 1), 
1, 
'We''re definitely planning to expand into more track content! We have a mountain touge course in development right now that should be ready in about a month. It''s inspired by Japanese mountain passes with tight hairpins and technical sections.\n\nWe''re also working on a large airport/industrial area that can be configured for drift events, time attack, or drag racing. If there are specific types of environments you''d like to see, please let us know!', 
NOW() - INTERVAL '11 days', 
NOW() - INTERVAL '11 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Will we see more track mods%' LIMIT 1), 
8, 
'That sounds amazing! I''d love to see a dedicated rallycross track with mixed surfaces. Something with jumps, water splashes, and alternating tarmac/dirt sections would be perfect for testing the rally cars.', 
NOW() - INTERVAL '10 days', 
NOW() - INTERVAL '10 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Will we see more track mods%' LIMIT 1), 
9, 
'I''d pay good money for a proper recreation of some iconic real-world tracks. Something like Pikes Peak or Goodwood would be incredible for testing hillclimb builds.', 
NOW() - INTERVAL '8 days', 
NOW() - INTERVAL '8 days'),

-- Screenshots thread
((SELECT id FROM forum_threads WHERE title LIKE 'Show off your modded BeamNG%' LIMIT 1), 
6, 
'Here''s my JSD Velocity X on the coastal highway! [imagine a screenshot was linked here] The aerodynamic parts kit totally transforms the look. I''m running the Stage 3 performance package and it absolutely flies.', 
NOW() - INTERVAL '17 days', 
NOW() - INTERVAL '17 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Show off your modded BeamNG%' LIMIT 1), 
10, 
'Check out this action shot of the Trophy Truck mid-jump! [imagine a screenshot was linked here] The suspension travel is incredible, landed this perfectly from about 30 feet up and kept going. The desert map is perfect for this beast.', 
NOW() - INTERVAL '10 days', 
NOW() - INTERVAL '10 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Show off your modded BeamNG%' LIMIT 1), 
9, 
'Those are awesome shots! The Trophy Truck looks insane in mid-air. Here''s another one of my Bandit at sunset with the new light bar mod: [imagine a screenshot was linked here] The volumetric dust effects really add to the atmosphere.', 
NOW() - INTERVAL '2 days', 
NOW() - INTERVAL '2 days'),

-- Kei car thread
((SELECT id FROM forum_threads WHERE title LIKE 'Request: 90s Japanese Kei car%' LIMIT 1), 
5, 
'I would absolutely buy this! Kei cars are so underrepresented in racing games despite being super fun to drive. The tiny wheelbase and limited power makes them really rewarding when you get the most out of them.', 
NOW() - INTERVAL '21 days', 
NOW() - INTERVAL '21 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Request: 90s Japanese Kei car%' LIMIT 1), 
2, 
'Thanks for the suggestion! We''ve actually been considering a 90s Japanese Kei sports car for our next project. It''s great to see there''s interest in this. Would you prefer a more stock-focused accurate reproduction, or something with lots of modification options for engine swaps and wider body kits?', 
NOW() - INTERVAL '19 days', 
NOW() - INTERVAL '19 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Request: 90s Japanese Kei car%' LIMIT 1), 
10, 
'Personally, I''d love to see both! Start with an historically accurate base model that captures the essence of these quirky cars, but then also include some wild modification options. Part of the appeal of Kei cars is how people modify them far beyond their original specs while keeping the compact dimensions.', 
NOW() - INTERVAL '18 days', 
NOW() - INTERVAL '18 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Request: 90s Japanese Kei car%' LIMIT 1), 
11, 
'Another vote for this! I''d especially love to see some of the quirky features these cars had - like the Cappuccino''s removable roof panels that could be stored in the trunk. The engineering that went into these tiny powerhouses is fascinating.', 
NOW() - INTERVAL '15 days', 
NOW() - INTERVAL '15 days'),

-- Muscle car thread
((SELECT id FROM forum_threads WHERE title LIKE 'Request: American Muscle%' LIMIT 1), 
8, 
'I''ve been wanting a proper muscle car pack for ages! Especially interested in seeing some Mopar representation - a good Challenger or Charger equivalent would be amazing. With authentic V8 sounds and visual customization options, this would be an instant buy.', 
NOW() - INTERVAL '15 days', 
NOW() - INTERVAL '15 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Request: American Muscle%' LIMIT 1), 
1, 
'We''re definitely interested in creating some American muscle! It''s a bit challenging to get the suspension dynamics right since these cars handle so differently from modern vehicles, but we''re up for the challenge. I''ve added this to our development roadmap to explore after our current projects are complete. Thanks for the suggestion!', 
NOW() - INTERVAL '14 days', 
NOW() - INTERVAL '14 days'),

-- Rally Monster thread
((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JSD Rally Monster%' LIMIT 1), 
5, 
'This looks incredible! The suspension travel in that preview video is insane. Will there be different livery options available? And please tell me we can adjust the anti-lag system for those sweet backfires!', 
NOW() - INTERVAL '9 days', 
NOW() - INTERVAL '9 days'),

((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JSD Rally Monster%' LIMIT 1), 
2, 
'Thanks for the excitement! Yes, we''ll have 8 different livery options at launch, plus a customizable one where you can change the base colors. And the anti-lag is fully configurable - you can adjust timing, intensity, and even disable it completely if you prefer a cleaner sound. The backfire effects have dynamic lighting too!', 
NOW() - INTERVAL '9 days', 
NOW() - INTERVAL '9 days'),

((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JSD Rally Monster%' LIMIT 1), 
10, 
'Day one purchase for me! Will premium subscribers get any exclusive liveries or parts with this one? The suspension looks perfect for the rally scenarios I like to set up.', 
NOW() - INTERVAL '7 days', 
NOW() - INTERVAL '7 days'),

((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JSD Rally Monster%' LIMIT 1), 
2, 
'Premium subscribers will get an exclusive ''Championship Edition'' livery with custom mudflaps and light pod configuration. They''ll also receive a tuning preset file that we developed with the help of an actual rally driver for the perfect gravel setup. Hope you enjoy it!', 
NOW() - INTERVAL '5 days', 
NOW() - INTERVAL '5 days'),

-- JBX Classic thread
((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JBX Classic%' LIMIT 1), 
12, 
'Absolutely beautiful model! The attention to detail on the interior is outstanding. I''m a sucker for classic sports cars with their analog driving feel. Will we be able to toggle between original-spec performance and enhanced modern options?', 
NOW() - INTERVAL '7 days', 
NOW() - INTERVAL '7 days'),

((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JBX Classic%' LIMIT 1), 
1, 
'Thank you for the kind words! Yes, we''ve implemented a unique system for this car where you can toggle between ''Classic'' and ''Restomod'' configurations. Classic gives you the authentic 60s driving experience with period-correct limitations, while Restomod maintains the vintage look but with modern suspension geometry, braking performance, and optional engine enhancements. You can even mix and match - like keeping the vintage engine but upgrading the suspension.', 
NOW() - INTERVAL '7 days', 
NOW() - INTERVAL '7 days'),

((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JBX Classic%' LIMIT 1), 
6, 
'The sound in that showcase video is amazing! Did you record an actual vintage engine for this? The exhaust note has that perfect raspy tone that modern cars just don''t have.', 
NOW() - INTERVAL '5 days', 
NOW() - INTERVAL '5 days'),

((SELECT id FROM forum_threads WHERE title LIKE '[SHOWCASE] JBX Classic%' LIMIT 1), 
1, 
'Good ear! We actually recorded a restored 1967 sports car with a similar engine configuration. We captured dozens of audio samples at different RPMs and load conditions to get that authentic sound. The in-game engine note dynamically changes based on load, RPM, and even exhaust configuration if you modify it.', 
NOW() - INTERVAL '3 days', 
NOW() - INTERVAL '3 days'),

-- Jbeam physics thread
((SELECT id FROM forum_threads WHERE title LIKE 'Understanding BeamNG''s Jbeam%' LIMIT 1), 
12, 
'This is incredibly helpful, thanks! I''ve been struggling with getting the suspension geometry right on my mod. One question - what''s the best approach for modeling anti-roll bars in the Jbeam system? I''ve tried a few methods but can''t get the right balance between roll stiffness and articulation.', 
NOW() - INTERVAL '44 days', 
NOW() - INTERVAL '44 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Understanding BeamNG''s Jbeam%' LIMIT 1), 
3, 
'Great question about anti-roll bars! The most effective method I''ve found is to use dedicated anti-roll bar beams with specific spring and damping values, rather than just stiffening the existing suspension beams. This allows for more natural articulation while still controlling body roll.

You''ll want to create beams that connect the left and right suspension components (usually at the control arms) with carefully tuned beam properties. The key parameters to focus on are:

- `springExpansion` and `springCompression`: These control the stiffness of the anti-roll effect
- `dampExpansion` and `dampCompression`: Keep these relatively low to avoid affecting rapid suspension movements

The BeamNG Pickup is a good reference model to study - check out its anti-roll bar implementation in the Jbeam files.', 
NOW() - INTERVAL '43 days', 
NOW() - INTERVAL '43 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Understanding BeamNG''s Jbeam%' LIMIT 1), 
10, 
'I''m having trouble with wheels clipping through fenders during extreme compression. Is there a recommended way to set up collision properly between suspension components and body panels?', 
NOW() - INTERVAL '40 days', 
NOW() - INTERVAL '40 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Understanding BeamNG''s Jbeam%' LIMIT 1), 
3, 
'For wheel-to-fender collision, you need to ensure you have proper collision triangles defined on both the wheel well and the wheel itself. A common mistake is forgetting to add collision triangles to the inner fender surfaces.

You can also add ''stopped'' beam properties to create hard stops for suspension travel before visual clipping occurs. Look for the `beamPrecompression` and `beamDeform` parameters - these can be tuned to create progressive stiffening as the suspension approaches maximum compression.

If you''re still having issues, check that your wheel collision mesh isn''t too simplified. Sometimes adding a few more collision triangles to represent the tire sidewall can solve persistent clipping problems.', 
NOW() - INTERVAL '35 days', 
NOW() - INTERVAL '35 days'),

-- Optimization thread
((SELECT id FROM forum_threads WHERE title LIKE 'Optimization techniques%' LIMIT 1), 
9, 
'I''ve had good results using a multi-tier LOD system with these general polygon targets:

- Exterior (visible from distance): ~100k polys
- Engine bay components: ~150k polys combined
- Interior: ~120k polys
- Undercarriage: ~80k polys

The key is being strategic about where you maintain detail. For example, cluster more polygons around complex curves and panel gaps, while simplified flat surfaces. Normal maps are essential for maintaining the appearance of small details like panel stamping and fabric textures.', 
NOW() - INTERVAL '6 days', 
NOW() - INTERVAL '6 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Optimization techniques%' LIMIT 1), 
3, 
'Great question about optimization! Here''s my approach:

1. For mechanical parts like engine components, you can often reduce interior/hidden geometry substantially. Players rarely see the inside of an engine block or transmission case.

2. Use normal maps aggressively for surface details like vents, grilles, and interior textures.

3. For LOD strategy, I recommend 3 levels with approximately 60% and 30% of original poly count. LOD distance in BeamNG is quite generous.

4. Texture resolution matters more than you might think - a well-textured lower-poly model often looks better than a high-poly model with basic textures. 2K textures for exteriors and 1K for smaller parts is usually sufficient.

5. Look for redundant edge loops and n-gons in your model - these are often easy targets for optimization.

Happy to review your model if you want to share some screenshots of the wireframe!', 
NOW() - INTERVAL '5 days', 
NOW() - INTERVAL '5 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Optimization techniques%' LIMIT 1), 
12, 
'Thank you both for the detailed advice! I''ve started implementing a more aggressive LOD system and focusing my high-poly detail on the parts that are most visible during gameplay. The normal map suggestion was particularly helpful - I''ve managed to move a lot of small details like bolts and panel seams to normal maps instead of geometry.

One follow-up question: for transparent parts like headlights and glass, are there any special considerations for optimization? They seem particularly demanding on performance.', 
NOW() - INTERVAL '3 days', 
NOW() - INTERVAL '3 days'),

((SELECT id FROM forum_threads WHERE title LIKE 'Optimization techniques%' LIMIT 1), 
3, 
'Excellent question about transparent parts! They do require special handling:

1. Transparent materials are indeed more performance-heavy due to the rendering order requirements. Keep polygon count especially low for these parts.

2. For headlights, model only the visible outer lens and reflector in detail. The interior bulb and housing can be much lower poly or even just textured.

3. For glass, avoid double-sided materials when possible. It''s better to model thin glass with single-sided faces than use double-sided materials.

4. Limit overlapping transparent layers - each layer of transparency adds rendering cost.

5. For complex headlight assemblies, consider using masked/cutout transparency instead of true transparency for internal details.

Implementing these techniques can significantly improve performance without noticeable visual quality loss.', 
NOW() - INTERVAL '2 days', 
NOW() - INTERVAL '2 days');

-- Now update the thread reply counts to match the actual counts
UPDATE forum_threads 
SET reply_count = (
    SELECT COUNT(*) 
    FROM forum_replies 
    WHERE forum_replies.thread_id = forum_threads.id
);

-- And update the updated_at timestamps based on the latest reply
UPDATE forum_threads
SET updated_at = (
    SELECT MAX(created_at)
    FROM forum_replies
    WHERE forum_replies.thread_id = forum_threads.id
)
WHERE EXISTS (
    SELECT 1
    FROM forum_replies
    WHERE forum_replies.thread_id = forum_threads.id
);