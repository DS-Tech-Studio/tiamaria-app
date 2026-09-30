import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: { user: { id: string } },
  ) {
    if (
      request.user.id === id &&
      updateUserDto.role &&
      updateUserDto.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'No puedes quitarte el rol de administrador',
      );
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: { user: { id: string } },
  ) {
    if (request.user.id === id) {
      throw new ForbiddenException('No puedes desactivar tu propio usuario');
    }

    return this.usersService.toggleStatus(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: { user: { id: string } },
  ) {
    if (request.user.id === id) {
      throw new ForbiddenException('No puedes eliminar tu propio usuario');
    }

    return this.usersService.remove(id);
  }
}
