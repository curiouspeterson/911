import { getUsersWithRoles } from '@/app/actions/admin-actions';
import { UserRolesTable } from '@/components/admin/user-roles-table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function UserManagementPage() {
  const { data, error } = await getUsersWithRoles();

  if (error || !data) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              'Could not load user data. You may not have permission to view this page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <CardDescription>
            View and manage user roles across the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserRolesTable initialUsers={data.users} allRoles={data.roles} />
        </CardContent>
      </Card>
    </div>
  );
}
