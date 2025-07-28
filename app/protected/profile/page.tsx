import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProfileForm from './profile-form';

async function getProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export default async function ProfilePage() {
  const profile = await getProfileData();

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Profile not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profile.avatar_url || ''}
                alt={profile.full_name || 'User'}
              />
              <AvatarFallback>
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              {/* @ts-ignore */}
              <CardDescription>{profile.users.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Assigned Pattern</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {profile.assigned_pattern || 'Not set'}
            </p>
          </div>
        </CardContent>
      </Card>

      <ProfileForm profile={profile} />
    </div>
  );
}
