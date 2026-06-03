import { IsEmail, IsNotEmpty, IsString, IsArray, IsOptional, IsIn, IsEnum } from 'class-validator';

export class CreateMemberDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Owner', 'branch_manager', 'staff'], )
  role!: string;

  @IsArray()
  @IsOptional()
  branchIds!: number[];
}

export class UpdateMemberDTO {
  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;
}

export class UpdateMemberBranchesDTO {
  @IsArray()
  branchIds!: number[];
}
