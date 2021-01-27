import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Exclude, Expose } from 'class-transformer'

import uploadConfig from '@config/upload'

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  @Exclude()
  password: string

  @Column()
  avatar: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @Expose({ name: 'avatar_url' })
  getAvatarUrl(): string | null {
    if (!this.avatar) {
      return null
    }

    const storageDriver = {
      disk: `${process.env.API_URL}/files/${this.avatar}`,
      s3: `https://${uploadConfig.config.aws.bucket}.s3.amazonaws.com/${this.avatar}`,
    }

    return storageDriver[process.env.STORAGE_DRIVER as 's3' | 'disk'] || null
  }
}

export default User
