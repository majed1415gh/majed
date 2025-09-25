/*
  # إضافة عمود user_id لجميع الجداول

  1. التغييرات على الجداول
    - إضافة عمود `user_id` (uuid) لجدول `competitions`
    - إضافة عمود `user_id` (uuid) لجدول `scraped_competitions`
    - إضافة عمود `user_id` (uuid) لجدول `attachments`
    - إضافة عمود `user_id` (uuid) لجدول `company_profile`

  2. الأمان
    - تحديث سياسات RLS لجميع الجداول لتقييد الوصول حسب user_id
    - إضافة فهارس لتحسين الأداء

  3. ملاحظات مهمة
    - سيتم ربط user_id بـ auth.uid() من نظام المصادقة في Supabase
    - البيانات الموجودة ستحتاج إلى تحديث يدوي لإضافة user_id
*/

-- إضافة عمود user_id لجدول competitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE competitions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إضافة عمود user_id لجدول scraped_competitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scraped_competitions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE scraped_competitions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إضافة عمود user_id لجدول attachments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attachments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE attachments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إضافة عمود user_id لجدول company_profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_profile' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE company_profile ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_competitions_user_id ON competitions(user_id);
CREATE INDEX IF NOT EXISTS idx_scraped_competitions_user_id ON scraped_competitions(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profile_user_id ON company_profile(user_id);

-- تحديث سياسات RLS لجدول competitions
DROP POLICY IF EXISTS "Users can manage their own competitions" ON competitions;
CREATE POLICY "Users can manage their own competitions"
  ON competitions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- تحديث سياسات RLS لجدول scraped_competitions
DROP POLICY IF EXISTS "Users can view their own scraped competitions" ON scraped_competitions;
CREATE POLICY "Users can view their own scraped competitions"
  ON scraped_competitions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own scraped competitions" ON scraped_competitions;
CREATE POLICY "Users can insert their own scraped competitions"
  ON scraped_competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- تحديث سياسات RLS لجدول attachments
DROP POLICY IF EXISTS "Users can manage their own attachments" ON attachments;
CREATE POLICY "Users can manage their own attachments"
  ON attachments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- تحديث سياسات RLS لجدول company_profile
DROP POLICY IF EXISTS "Users can manage their own profile" ON company_profile;
CREATE POLICY "Users can manage their own profile"
  ON company_profile
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);