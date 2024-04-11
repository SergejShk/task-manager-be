import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import users, { NewUser, User } from './models/users';

export class UsersDb {
  constructor(private db: NodePgDatabase) {}

  public createUser = async (newUser: NewUser) => {
    return this.db.insert(users).values(newUser).returning();
  };

  public getUserByEmail = async (email: string) =>
    this.db.select().from(users).where(eq(users.email, email));

  public getUserById = async (id: number) =>
    this.db.select().from(users).where(eq(users.id, id));

  public updateUserPassword = async (user: User) =>
    this.db
      .update(users)
      .set({
        password: user.password,
      })
      .where(eq(users.id, user.id))
      .returning()
      .then(res => res[0]);
}
