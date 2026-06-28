INSERT INTO "providers" ("id", "name", "trade", "city", "state", "bio", "phone", "email", "avatar_url", "years_experience", "hourly_rate", "is_verified", "created_at") VALUES
(1, 'Marcus Rivera', 'Plumber', 'Austin', 'TX', 'Experienced plumbing professional serving the greater Austin area with top-tier residential and commercial plumbing services.', '555-0101', 'marcus@riveraplumbing.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 14, 85, true, now()),
(2, 'Linda Okafor', 'Electrician', 'Houston', 'TX', 'Licensed master electrician specializing in smart home installations, panel upgrades, and electrical safety inspections in Houston.', '555-0102', 'linda@okaforelectric.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 9, 95, true, now() - interval '1 hour'),
(3, 'Jake Thornton', 'Plumber', 'Dallas', 'TX', 'Master plumber with 18 years of experience in leak detection, water heater repair, and emergency plumbing across Dallas.', '555-0103', 'jake@thorntonplumbing.com', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 18, 90, true, now() - interval '2 hours'),
(4, 'Sofia Mendez', 'Electrician', 'San Antonio', 'TX', 'Dedicated residential electrician providing fast, reliable, and code-compliant electrical repairs and lighting installations in San Antonio.', '555-0104', 'sofia@mendezelectric.com', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 6, 75, true, now() - interval '3 hours'),
(5, 'David Chen', 'Plumber', 'Fort Worth', 'TX', 'Dedicated plumbing contractor specializing in eco-friendly water solutions, pipe replacements, and drainage clearing.', '555-0105', 'david@chenplumbing.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 12, 80, true, now() - interval '4 hours'),
(6, 'Robert Wilson', 'HVAC Technician', 'Austin', 'TX', 'Certified HVAC technician offering prompt AC repair, heating maintenance, and energy-efficient climate control solutions.', '555-0106', 'robert@wilsonhvac.com', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 15, 90, true, now() - interval '5 hours'),
(7, 'Thomas Wright', 'Carpenter', 'Austin', 'TX', 'Master carpenter with over 20 years crafting custom cabinetry, built-in shelving, and performing premium structural woodwork.', '555-0107', 'thomas@wrightwoodwork.com', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 20, 85, true, now() - interval '6 hours'),
(8, 'Rachel Green', 'HVAC Technician', 'Houston', 'TX', 'Commercial and residential HVAC specialist dedicated to clean air solutions, heat pump servicing, and rapid emergency dispatch.', '555-0108', 'rachel@greenhvac.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 11, 95, true, now() - interval '7 hours'),
(9, 'Kevin Vance', 'Roofer', 'Dallas', 'TX', 'Expert roofing contractor handling storm damage repairs, shingle replacement, and complete roof inspections with full warranties.', '555-0109', 'kevin@vanceroofing.com', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 16, 80, true, now() - interval '8 hours'),
(10, 'Aaliyah Jackson', 'Electrician', 'Austin', 'TX', 'Quick-response licensed electrician providing EV charger installations, rewiring, and circuit troubleshooting across Austin.', '555-0110', 'aaliyah@jacksonelectric.com', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', 8, 85, true, now() - interval '9 hours'),
(11, 'Brian O''Connor', 'Plumber', 'San Antonio', 'TX', 'High-quality plumbing specialist focusing on trenchless pipe lining, hydro jetting, and fixture modernization.', '555-0111', 'brian@oconnorplumbing.com', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 13, 90, true, now() - interval '10 hours'),
(12, 'Chloe Decker', 'General Contractor', 'Fort Worth', 'TX', 'Experienced general contractor managing full kitchen/bathroom remodeling, structural drywall, and property additions.', '555-0112', 'chloe@deckercontracting.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 14, 110, true, now() - interval '11 hours')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "trade" = EXCLUDED."trade",
  "city" = EXCLUDED."city",
  "state" = EXCLUDED."state",
  "bio" = EXCLUDED."bio",
  "avatar_url" = EXCLUDED."avatar_url",
  "years_experience" = EXCLUDED."years_experience",
  "created_at" = EXCLUDED."created_at";

SELECT setval('providers_id_seq', (SELECT max(id) FROM providers));

INSERT INTO "reviews" ("id", "provider_id", "reviewer_name", "rating", "comment", "created_at") VALUES
(1, 1, 'John D.', 5, 'Marcus was fantastic! Fixed our leaking pipe in no time.', now() - interval '2 days'),
(2, 1, 'Sarah M.', 5, 'Highly professional and very fair pricing. Will hire again.', now() - interval '3 days'),
(3, 1, 'Mike R.', 4, 'Great work, arrived slightly late but did a perfect job.', now() - interval '4 days'),
(4, 2, 'James P.', 5, 'Linda upgraded our main panel. Exceptional quality and very clean work.', now() - interval '1 day'),
(5, 2, 'Elena G.', 5, 'Very knowledgeable and helped set up all our smart light switches.', now() - interval '3 days'),
(6, 3, 'Tom H.', 4, 'Jake knows his stuff. Fixed the water heater quickly.', now() - interval '1 day'),
(7, 4, 'Maria C.', 5, 'Sofia was wonderful! Replaced our ceiling fans and added new outlets.', now() - interval '2 days'),
(8, 5, 'Ken W.', 5, 'David was very helpful and professional.', now() - interval '2 days'),
(9, 6, 'Amy L.', 5, 'Robert got our AC working right before the heatwave hit. Lifesaver!', now() - interval '1 day'),
(10, 7, 'Chris B.', 5, 'Thomas built beautiful custom bookshelves for our study. Top-tier craftsmanship!', now() - interval '2 days'),
(11, 8, 'Stephanie V.', 5, 'Rachel responded within an hour and fixed our heat pump. Highly recommend!', now() - interval '1 day'),
(12, 9, 'Dan P.', 5, 'Kevin inspected our roof after the hail storm and gave a very honest quote.', now() - interval '3 days'),
(13, 10, 'Jessica R.', 5, 'Aaliyah installed our Level 2 EV charger perfectly. Very neat wiring.', now() - interval '1 day'),
(14, 11, 'George K.', 5, 'Brian cleared our main sewer drain using hydro jetting. Excellent results.', now() - interval '2 days'),
(15, 12, 'Patricia M.', 5, 'Chloe managed our guest bathroom remodel from start to finish. Stunning work.', now() - interval '3 days')
ON CONFLICT ("id") DO UPDATE SET
  "provider_id" = EXCLUDED."provider_id",
  "reviewer_name" = EXCLUDED."reviewer_name",
  "rating" = EXCLUDED."rating",
  "comment" = EXCLUDED."comment";

SELECT setval('reviews_id_seq', (SELECT max(id) FROM reviews));
