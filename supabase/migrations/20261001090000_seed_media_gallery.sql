-- Restore the original mock metadata onto the four existing Supabase records.
-- Supabase remains the primary source; the hook uses MOCK_MEDIA only as a
-- fallback until records are available.
INSERT INTO media (
  slug,
  title,
  type,
  category,
  station_id,
  expedition_id,
  region,
  year,
  description,
  image_url,
  video_url,
  photographer,
  metadata
)
VALUES
  (
    'himadri-station',
    'Himadri Research Station under Northern Lights',
    'photograph',
    'Stations',
    (SELECT id FROM stations WHERE slug = 'himadri'),
    (SELECT id FROM expeditions WHERE slug = '15th-indian-arctic-expedition'),
    'Arctic',
    2022,
    'India''s Himadri station in Ny-Ålesund, Svalbard, lit by the aurora borealis during winter research observations.',
    'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920',
    '',
    'NCPOR Expedition Team',
    '{"resolution":"3840x2160","camera":"Canon EOS R5"}'::jsonb
  ),
  (
    'maitri-station',
    'Maitri Station Overview and Priyadarshini Lake',
    'photograph',
    'Stations',
    (SELECT id FROM stations WHERE slug = 'maitri'),
    (SELECT id FROM expeditions WHERE slug = '40th-indian-antarctic-expedition'),
    'Antarctica',
    2020,
    'Aerial perspective of Maitri station located in the rocky terrain of Schirmacher Oasis, East Antarctica.',
    'https://images.pexels.com/photos/20558172/pexels-photo-20558172.jpeg?auto=compress&cs=tinysrgb&w=1920',
    '',
    'Indian Antarctic Expedition',
    '{"resolution":"4000x3000","camera":"DJI Mavic 2 Pro"}'::jsonb
  ),
  (
    'bharati-station',
    'Bharati Station at Sunset, Larsemann Hills',
    'photograph',
    'Landscapes',
    (SELECT id FROM stations WHERE slug = 'bharati'),
    (SELECT id FROM expeditions WHERE slug = '43rd-indian-antarctic-expedition'),
    'Antarctica',
    2023,
    'Aerodynamic architecture of Bharati station set against Prydz Bay icebergs during midnight sun.',
    'https://images.pexels.com/photos/30251942/pexels-photo-30251942.jpeg?auto=compress&cs=tinysrgb&w=1920',
    '',
    'Dr. Thamban Meloth',
    '{"resolution":"3840x2160","camera":"Sony A7R IV"}'::jsonb
  ),
  (
    'polar-field-research',
    'Ice-Core Sampling Field Operations',
    'photograph',
    'Field Research',
    (SELECT id FROM stations WHERE slug = 'bharati'),
    (SELECT id FROM expeditions WHERE slug = '43rd-indian-antarctic-expedition'),
    'Antarctica',
    2023,
    'Indian scientists retrieving a 100-meter ice core on the Antarctic ice sheet near Larsemann Hills.',
    'https://images.pexels.com/photos/30429916/pexels-photo-30429916.jpeg?auto=compress&cs=tinysrgb&w=1920',
    '',
    'NCPOR Media Team',
    '{"resolution":"3840x2160"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  station_id = EXCLUDED.station_id,
  expedition_id = EXCLUDED.expedition_id,
  region = EXCLUDED.region,
  year = EXCLUDED.year,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  video_url = EXCLUDED.video_url,
  photographer = EXCLUDED.photographer,
  metadata = EXCLUDED.metadata;