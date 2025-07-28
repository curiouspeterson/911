'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserProfile } from '@/app/actions/user-actions';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

const ProfileSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters long.'),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

interface ProfileFormProps {
  profile: {
    full_name: string | null;
  };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('full_name', data.full_name);

    const result = await updateUserProfile(formData);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.',
      });
    } else {
      const errorMessage =
        result.error?.message || 'An unknown error occurred.';
      setServerError(errorMessage);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-2xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>
          {serverError && <p className="text-sm text-red-500">{serverError}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
