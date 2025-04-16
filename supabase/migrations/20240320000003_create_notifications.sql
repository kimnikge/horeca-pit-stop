-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_application', 'application_status')),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to create notification on new application
CREATE OR REPLACE FUNCTION create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, job_id, application_id)
  SELECT j.employer_id, 'new_application', NEW.job_id, NEW.id
  FROM jobs j
  WHERE j.id = NEW.job_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create notification on new application
CREATE TRIGGER create_application_notification_trigger
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION create_application_notification();

-- Create function to create notification on application status change
CREATE OR REPLACE FUNCTION create_status_change_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, job_id, application_id)
    VALUES (NEW.user_id, 'application_status', NEW.job_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create notification on application status change
CREATE TRIGGER create_status_change_notification_trigger
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION create_status_change_notification(); 