-- Seed Churches
INSERT INTO public.churches (name, logo_url, city, state) VALUES
('Igreja da Cidade', 'https://placehold.co/200/4F46E5/FFFFFF?text=IC', 'São José dos Campos', 'SP'),
('Lagoinha', 'https://placehold.co/200/E11D48/FFFFFF?text=L', 'Belo Horizonte', 'MG'),
('Bola de Neve', 'https://placehold.co/200/F59E0B/FFFFFF?text=BN', 'São Paulo', 'SP'),
('Batista da Lagoinha', 'https://placehold.co/200/10B981/FFFFFF?text=IBL', 'Niterói', 'RJ'),
('Comunidade das Nações', 'https://placehold.co/200/8B5CF6/FFFFFF?text=CN', 'Brasília', 'DF');

-- Seed Content
INSERT INTO public.content_items (type, title, description, cover_url, media_url, is_live, play_count) VALUES
('podcast', 'Café com Deus', 'Uma mensagem diária de fé e esperança para começar o seu dia.', 'https://placehold.co/400/4F46E5/FFFFFF?text=Cafe', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', false, 1540),
('podcast', 'Liderança Cristã', 'Princípios bíblicos para liderar com excelência.', 'https://placehold.co/400/E11D48/FFFFFF?text=Lider', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', false, 890),
('video', 'Culto de Celebração - Ao Vivo', 'Junte-se a nós para adorar e ouvir a Palavra.', 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Ao+Vivo', 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', true, 0),
('video', 'Série: O Poder da Oração', 'Episódio 1: Por que orar?', 'https://placehold.co/600x400/10B981/FFFFFF?text=Oracao', 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', false, 3200),
('music', 'Adoração Profunda', 'Uma playlist para momentos de intimidade com Deus.', 'https://placehold.co/400/8B5CF6/FFFFFF?text=Worship', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', false, 5600),
('music', 'Instrumental Prayer', 'Músicas instrumentais para oração e meditação.', 'https://placehold.co/400/6366F1/FFFFFF?text=Piano', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', false, 2100);

-- Note: Groups and Challenges require a valid user_id (linked to auth.users).
-- Run the seed script in the app or insert manually after creating a user.
