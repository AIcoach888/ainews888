-- 1. 创建文章表
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author TEXT,
  date TEXT, -- 或者使用 TIMESTAMPTZ
  read_time TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建用户资料表 (关联 Auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' 或 'admin'
  is_pro BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建收藏表
CREATE TABLE favorites (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  article_id UUID REFERENCES articles ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- 4. 创建阅读历史表
CREATE TABLE reading_history (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  article_id UUID REFERENCES articles ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- 开启 Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- 策略: 文章所有人可查
CREATE POLICY "Articles are viewable by everyone" ON articles
  FOR SELECT USING (true);

-- 策略: 仅管理员可以插入/修改/删除文章
CREATE POLICY "Only admins can insert articles" ON articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update articles" ON articles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 策略: 用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 策略: 用户只能管理自己的收藏
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- 策略: 用户只能管理自己的阅读历史
CREATE POLICY "Users can manage own reading history" ON reading_history
  FOR ALL USING (auth.uid() = user_id);

-- 触发器: 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 插入一些初始数据
INSERT INTO articles (title, excerpt, category, author, date, read_time, image_url, likes_count)
VALUES 
('GPT-5 传闻：目前我们所知的一切功能预测与发布时间表', '随着人工智能领域的飞速发展，关于 OpenAI 下一代大模型的传闻也日益增多...', '大模型资讯', 'Sarah Chen', '2小时前', '8分钟', 'https://images.unsplash.com/photo-1677442136019-21780ecad995', 12000),
('Midjourney V7 Alpha 测试开始，文本渲染能力大幅提升', 'Midjourney 官方近日开启了 V7 版本的 Alpha 测试...', 'AI绘画', 'David Miller', '5小时前', '5分钟', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 8400),
('新 Python 库助力 mobile 端模型优化提速 50%', '谷歌发布了针对移动端优化的全新 TensorFlow Lite 库...', 'AI编程', 'James Wilson', '8小时前', '10分钟', 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb', 3200);

-- 注意：您需要手动将某个用户的 role 改为 'admin' 以便进入后台
-- 例如：UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = '您的管理员邮箱');

-- 5. 配置 Storage 权限 (存储桶: article-images)
-- 注意：请先在 Supabase 控制台创建名为 'article-images' 的存储桶并设为 Public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有人查看图片
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');

-- 仅允许管理员上传/修改/删除
CREATE POLICY "Admin CRUD" ON storage.objects FOR ALL 
  USING (
    bucket_id = 'article-images' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'article-images' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
