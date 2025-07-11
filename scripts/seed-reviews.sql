-- Insert realistic reviews for mods
-- First, get a list of all mods
DO $$ 
DECLARE
    mod_record RECORD;
    user_id INTEGER;
    rating INTEGER;
    comment_text TEXT;
    review_date TIMESTAMP;
    
    -- Realistic review comments based on rating
    five_star_comments TEXT[] := ARRAY[
        'Easily the best %s mod I''ve used in BeamNG. The handling feels exactly like you''d expect, and the attention to detail is incredible. From the dashboard to the engine bay, everything is modeled perfectly. No performance issues at all on my system.',
        'Been using this for about a week now and it''s become my go-to vehicle for %s driving. The suspension tuning is spot on - not too soft, not too stiff. Visually stunning and performs great even with my mid-range PC. Highly recommended!',
        'This is exactly what the game needed. The quality is on par with official content, maybe even better in some areas. The sounds are incredibly detailed - you can hear every little mechanical component working. Worth every penny and then some.',
        'JSD has outdone themselves with this one. I was skeptical about the price, but after trying it I can say it''s completely justified. The physics model is incredibly detailed - you can feel weight transfer in a way most mods don''t capture. And it plays nice with other mods too!',
        'The customization options alone make this worth it. So many tuning parts and visual options to choose from! I''ve spent hours just configuring different setups for various tracks. Performs flawlessly and looks beautiful with realistic reflections on the paint.'
    ];
    
    four_star_comments TEXT[] := ARRAY[
        'Really solid %s mod with great handling characteristics. Textures and model quality are top-notch. Only reason it''s not 5 stars is some minor clipping issues with the wheels during extreme compression. Otherwise, it''s fantastic.',
        'I''m enjoying this mod a lot - it fills a niche that was missing in BeamNG. The driving physics feel authentic and the detail level is impressive. Took off one star because the engine sound could use a bit more depth at high RPM, but that''s a minor nitpick.',
        'Great addition to my mod collection. Performance is excellent and it looks stunning, especially the interior details. The only small issue is that some of the tuning options seem to have minimal effect on handling. Still definitely recommend it though!',
        'Excellent quality overall. The model is beautiful and the physics are well-implemented. I would have given 5 stars but there''s a small issue with the brake lights staying on sometimes. Easy workaround is to tap the brake again. Otherwise perfect!',
        'Really enjoying this mod. The handling is realistic and challenging in a fun way, and it looks fantastic. Only giving 4 stars because it''s a bit demanding on system resources compared to similar mods, but if you have a decent system it''s absolutely worth it.'
    ];
    
    three_star_comments TEXT[] := ARRAY[
        'Decent mod with good visuals, but the handling feels a bit off. Too much understeer in corners that similar cars wouldn''t struggle with. Worth the purchase if you''re specifically looking for a %s vehicle, but there are better options in the same price range.',
        'Mixed feelings about this one. The exterior modeling is excellent and the customization options are nice, but the suspension feels too stiff even on the softest settings. Also had some texture glitches on certain parts. It''s good, but needs some refinement.',
        'It''s an okay mod. Looks great in screenshots but performance takes a hit on my system (i5, GTX 1060). The physics are decent though not exceptional. Fair value for the price, but don''t expect it to become your favorite vehicle.',
        'Middle-of-the-road mod. The good: beautiful model, lots of parts, works without crashing. The bad: sound design is generic, handling feels artificial, and some textures are lower resolution than they should be. Worth it on sale maybe.',
        'Some things to like here, some things that need improvement. On the positive side, it''s stable and looks pretty good. But the weight distribution feels off, making it too easy to lose control in situations where it shouldn''t happen. Has potential with updates.'
    ];
    
    two_star_comments TEXT[] := ARRAY[
        'Disappointing for the price. While it looks decent in screenshots, there are numerous issues: texture stretching on certain panels, incorrect collision model causing strange crashes, and the handling is far too twitchy. Needs significant updates.',
        'Had high hopes but this falls short. The model itself is okay, but there are serious physics issues - the car bounces unrealistically over small bumps and the tires seem to have almost no grip on standard roads. Not recommended until these are fixed.',
        'Below average quality for what JSD usually puts out. Looks rushed with low-res textures in the interior and engine bay. The handling model is simplified compared to their other work too. Wait for updates or a price drop.',
        'Not worth the current price. Performance impact is way too high for the quality offered, and there are several visual glitches especially with damage modeling. The sound design is also quite generic and lacks character.',
        'Several issues that ruin the experience. Conflicts with other popular mods causing game instability, suspension geometry seems off making the vehicle handle strangely, and some parts are clearly unfinished. Needs more development time.'
    ];
    
    one_star_comments TEXT[] := ARRAY[
        'Waste of money in its current state. Constant physics glitches, textures failing to load properly, and it actually crashed my game three times. The model looks decent in screenshots but that doesn''t matter if it doesn''t work properly.',
        'Extremely disappointed. This mod has serious compatibility issues with the latest BeamNG update. The wheels clip through the body, the dashboard is missing textures, and the physics are completely unrealistic. Cannot recommend.',
        'Doesn''t work as advertised. The customization options shown in the preview aren''t actually in the mod, the performance impact is massive even on high-end systems, and the handling is completely broken. Save your money.',
        'One of the worst mods I''ve purchased. Low quality across the board - from boxy, low-poly modeling to generic engine sounds that don''t match the vehicle type at all. Feels like something from 5+ years ago, not a premium mod in 2025.',
        'Serious issues make this unusable. The collision model is completely wrong causing the vehicle to get stuck on minor obstacles, textures are low resolution, and most disappointingly, the handling feels nothing like a real %s vehicle should.'
    ];
    
    -- Rating distribution weights (to make 5-stars most common, etc.)
    rating_weights INTEGER[] := ARRAY[45, 30, 15, 7, 3]; -- 5★, 4★, 3★, 2★, 1★ respectively
    rating_sum INTEGER := 0;
    
    -- Temporary variables for processing
    random_val INTEGER;
    terrain_type TEXT;
    random_index INTEGER;
    
BEGIN
    -- Calculate sum of weights for rating distribution
    SELECT SUM(w) INTO rating_sum FROM UNNEST(rating_weights) w;
    
    -- Loop through each mod
    FOR mod_record IN SELECT * FROM mods
    LOOP
        -- Generate between 2 and 8 reviews per mod
        FOR i IN 1..FLOOR(RANDOM() * 7 + 2)::INTEGER
        LOOP
            -- Select a user ID that is not an admin (user_id > 3)
            user_id := FLOOR(RANDOM() * 17 + 4)::INTEGER;
            
            -- Select a rating based on weighted distribution
            random_val := FLOOR(RANDOM() * rating_sum)::INTEGER;
            IF random_val < rating_weights[1] THEN
                rating := 5;
            ELSIF random_val < rating_weights[1] + rating_weights[2] THEN
                rating := 4;
            ELSIF random_val < rating_weights[1] + rating_weights[2] + rating_weights[3] THEN
                rating := 3;
            ELSIF random_val < rating_weights[1] + rating_weights[2] + rating_weights[3] + rating_weights[4] THEN
                rating := 2;
            ELSE
                rating := 1;
            END IF;
            
            -- Determine terrain type for placeholder
            CASE 
                WHEN mod_record.category = 'offroad' THEN terrain_type := 'off-road';
                WHEN mod_record.category = 'racing' THEN terrain_type := 'track';
                WHEN mod_record.category = 'drift' THEN terrain_type := 'drift';
                ELSE terrain_type := 'road';
            END CASE;
            
            -- Select a comment template based on rating and fill in the placeholders
            CASE 
                WHEN rating = 5 THEN
                    random_index := FLOOR(RANDOM() * ARRAY_LENGTH(five_star_comments, 1) + 1)::INTEGER;
                    comment_text := FORMAT(five_star_comments[random_index], COALESCE(mod_record.category, 'vehicle'));
                WHEN rating = 4 THEN
                    random_index := FLOOR(RANDOM() * ARRAY_LENGTH(four_star_comments, 1) + 1)::INTEGER;
                    comment_text := FORMAT(four_star_comments[random_index], COALESCE(mod_record.category, 'vehicle'));
                WHEN rating = 3 THEN
                    random_index := FLOOR(RANDOM() * ARRAY_LENGTH(three_star_comments, 1) + 1)::INTEGER;
                    comment_text := FORMAT(three_star_comments[random_index], COALESCE(mod_record.category, 'vehicle'));
                WHEN rating = 2 THEN
                    random_index := FLOOR(RANDOM() * ARRAY_LENGTH(two_star_comments, 1) + 1)::INTEGER;
                    comment_text := FORMAT(two_star_comments[random_index], COALESCE(mod_record.category, 'vehicle'));
                ELSE
                    random_index := FLOOR(RANDOM() * ARRAY_LENGTH(one_star_comments, 1) + 1)::INTEGER;
                    comment_text := FORMAT(one_star_comments[random_index], COALESCE(mod_record.category, 'vehicle'));
            END CASE;
            
            -- Replace terrain placeholders
            comment_text := REPLACE(comment_text, '%s driving', terrain_type || ' driving');
            
            -- Create review date (between 1-60 days ago)
            review_date := NOW() - (FLOOR(RANDOM() * 60) + 1) * INTERVAL '1 day';
            
            -- Insert the review
            INSERT INTO reviews (user_id, mod_id, rating, comment, created_at, updated_at)
            VALUES (user_id, mod_record.id, rating, comment_text, review_date, review_date);
            
        END LOOP;
        
        -- Calculate and update average rating for this mod
        UPDATE mods
        SET average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM reviews
            WHERE mod_id = mod_record.id
        )
        WHERE id = mod_record.id;
        
    END LOOP;
    
    RAISE NOTICE 'Review seeding completed!';
END $$;