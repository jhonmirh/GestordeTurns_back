import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserWithAdminDto } from "./dto/admin-user.dto";
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import UserResponseDto from "./dto/response-user.dto";
import { IsUUID } from "class-validator";
import { updateUserDto } from "./dto/update-user.dto";
import { User } from "./users.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { Roles } from "src/decorators/roles.decorator";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { UpdateProfileDto } from "../auth/dto/update-usergoogle.dt";
import { MailService } from "src/notifications/mail.service";





@ApiTags("Users")
@Controller('users')
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
        private readonly mailService: MailService
    ) {}

    @Post('login')
    @ApiOperation({ summary: 'Loguear un usuario' })
    @ApiResponse({ status: 201, description: 'Usuario logueado exitosamente', type: LoginUserDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al loguear el usuario' })
    async signIn(@Body() credentials: LoginUserDto){
        return this.usersService.login(credentials)
    }

    @Post('register')
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: CreateUserDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al crear el usuario' })
    async createUser(@Body() createUser: CreateUserDto, @Req() request){
        const user = await this.usersService.createUser(createUser)

         // Enviar correo de confirmación
        await this.mailService.sendMail(
        createUser.email,
        'Bienvenido a JhonDay',
        'Gracias por registrarte.',
        '<h1>Te damos la bienvenida a JhonDay!!</h1><p>Gracias por registrarte.</p>',
        );
        return {
            message: `Usuario creado exitosamente`,
            userId: user.id
        };
    }

    @Get()  
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Usuarios obtenidos', type: [UserWithAdminDto] })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', example: 5 })
    async getUsersPag(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 5
    ): Promise<UserWithAdminDto[]> { 
        console.log('getUsersPag called');
        return this.usersService.getUsers(page, limit);
    
    }


    


    @Get(':id')
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario obtenido', type: UserResponseDto})
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async getUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserResponseDto>{
        const user = await this.usersService.getUserById(id)
        if(!IsUUID(4, { each: true})){
            throw new HttpException('Invalid UUID', HttpStatus.BAD_REQUEST)
        }
        if(!user){
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND)
        }
        return new UserResponseDto(user)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado', type: updateUserDto })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async updateUsers(@Param('id') id: string, @Body() updateUser: updateUserDto): Promise<User>{
        const user = await this.usersService.updateUsers(id, updateUser) 
        return user;
    }


    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un usuario por ID' })
    @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async deleteUsers(@Param('id') id: string): Promise<{id: string}>{
        const result = await this.usersService.removeUsers(id)
        if(!result){
            throw new NotFoundException(`Usuario con ${id} no fue encontrado`);
        }

        return {id}
    }

}